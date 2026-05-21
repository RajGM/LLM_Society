/**
 * Real Graph Importer — bridges real-world cascade datasets into simulation format.
 *
 * Supports FakeNewsNet and PHEME cascade JSON formats.
 *
 * Persona inference is the weakest link: bio keyword matching is noisy.
 * The paper's sensitivity analysis (--validate-sensitivity) tests how much
 * the inference method matters vs the topology itself.
 */

const path  = require("path");
const { readJSON, writeJSON, fileExists, ensureDir } = require("./fileIO");
const { callLLM } = require("./llmClient");

// Ordered from most to least specific — first matching rule wins
const BIO_RULES = [
  // Verified high-follower roles
  [/news|media|reporter|correspondent/,          100000, "neutral_news",             true],
  [/journalist|editor|correspondent/,             10000, "investigative_journalist",  false],
  // Expert personas
  [/doctor|md\b|physician|surgeon|medical/,          0, "medical_expert",            false],
  [/science|research|phd|professor|academic/,        0, "tech_expert",               false],
  [/economist|finance|analyst|investor/,             0, "startup_founder",           false],
  // Ideological right-wing signals
  [/maga|trump|patriot|2a|conservative|gop|republican|god bless america/,  0, "politically_biased_right", false],
  // Ideological left-wing signals
  [/progressive|resist|blm|democrat|liberal|justice|equity|socialist/,     0, "politically_biased_left",  false],
  // Domain personas
  [/climate|environment|green|sustainability|eco/,   0, "environmentalist",         false],
  [/pastor|church|faith|christian|muslim|religion|god|bible|prayer/,       0, "religious_leader",        false],
  [/lgbtq|pride|queer|trans|gay|lesbian/,            0, "lgbtq_advocate",           false],
  [/parent|mom|dad|family|kids|baby|toddler/,        0, "young_parent",             false],
  [/teacher|educator|school|classroom|curriculum/,   0, "rural_educator",           false],
  [/startup|founder|ceo|entrepreneur|founder/,       0, "startup_founder",          false],
  [/lifestyle|beauty|fashion|fitness|influencer/,    0, "lifestyle_influencer",     false],
  [/tech|software|coding|developer|engineer/,        0, "gadget_enthusiast",        false],
  [/opinion|columnist|pundit|commentator/,           0, "opinion_columnist",        false],
];

class RealGraphImporter {

  // ── Cascade import ────────────────────────────────────────────────────────

  /**
   * Import a cascade from FakeNewsNet or PHEME JSON format.
   *
   * Expected input JSON:
   * {
   *   "news_id": "...",
   *   "label": "fake" | "real",
   *   "seed_user": "user_A",          // optional — inferred from retweet chains if missing
   *   "tweet_ids": [...],             // optional metadata
   *   "retweets": [
   *     { "user_id": "B", "retweeted_from": "A", "timestamp": "2018-..." },
   *     ...
   *   ],
   *   "user_profiles": {
   *     "A": { "followers": 150000, "verified": true, "description": "Reporter at NYT" },
   *     ...
   *   }
   * }
   *
   * Also supports PHEME thread format (uses "replies" instead of "retweets").
   *
   * Returns a Simulation config with topology: "custom".
   */
  static importCascade(cascadeFile, inferenceStrategy = "inferred") {
    const cascade    = readJSON(cascadeFile);
    const profiles   = cascade.user_profiles || {};
    const retweets   = cascade.retweets || cascade.replies || [];

    // Collect unique users
    const userIds = new Set();
    for (const rt of retweets) {
      if (rt.user_id)         userIds.add(String(rt.user_id));
      if (rt.retweeted_from)  userIds.add(String(rt.retweeted_from));
      if (rt.replied_to)      userIds.add(String(rt.replied_to));
    }
    // Ensure seed user is included
    if (cascade.seed_user) userIds.add(String(cascade.seed_user));

    if (userIds.size === 0) {
      throw new Error(`Cascade ${cascadeFile} has no users — check format`);
    }

    // Map users to personas
    const personaMapping = {};
    const nodes = [];
    for (const userId of userIds) {
      const profile  = profiles[userId] || {};
      const personaId = RealGraphImporter.inferPersona(profile, inferenceStrategy);
      personaMapping[userId] = personaId;

      nodes.push({
        nodeId:      `user_${userId}`,
        personaId,
        modelId:     null, // caller supplies defaultModel
        realUserId:  userId,
        _realProfile: {
          followers: profile.followers || 0,
          verified:  profile.verified  || false,
          accountAge: profile.account_age || null,
        },
      });
    }

    // Build directed edges from retweet/reply chains
    const edgeSet = new Set();
    const edges   = [];
    for (const rt of retweets) {
      const srcId  = String(rt.retweeted_from || rt.replied_to || "");
      const destId = String(rt.user_id || "");
      if (!srcId || !destId || srcId === destId) continue;

      const key = `${srcId}->${destId}`;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);

      edges.push({
        from:  `user_${srcId}`,
        to:    `user_${destId}`,
        trust: RealGraphImporter.estimateTrust(
          profiles[srcId]  || {},
          profiles[destId] || {},
        ),
      });
    }

    // Identify seed node: nodes that appear as retweeted_from but never as retweeter
    const retweeters  = new Set(retweets.map((rt) => String(rt.user_id || rt.user_id)));
    const retweetedFrom = new Set(retweets.map((rt) => String(rt.retweeted_from || rt.replied_to || "")));
    const seedIds = [...retweetedFrom].filter((u) => u && !retweeters.has(u));
    const seedNodes = (cascade.seed_user
      ? [`user_${cascade.seed_user}`]
      : seedIds.map((u) => `user_${u}`)
    ).filter((n) => nodes.some((nd) => nd.nodeId === n));

    if (seedNodes.length === 0) {
      // Fall back to the first node
      seedNodes.push(nodes[0].nodeId);
    }

    return {
      topology:    "custom",
      nodes,
      edges,
      seedNodes,
      _realData: {
        source:         path.resolve(cascadeFile),
        newsId:         cascade.news_id || path.basename(cascadeFile, ".json"),
        label:          cascade.label || "unknown",
        totalUsers:     userIds.size,
        totalRetweets:  retweets.length,
        personaMapping,
        inferenceStrategy,
      },
    };
  }

  // ── Persona inference ─────────────────────────────────────────────────────

  /**
   * Infer a persona from a real user profile.
   *
   * strategy options:
   *   "inferred"      — bio keyword matching (default, most realistic)
   *   "follower_only" — follower count bands only
   *   "random"        — fully random (control condition)
   *   "neutral"       — all nodes → "neutral" persona
   */
  static inferPersona(profile, strategy = "inferred") {
    if (strategy === "neutral")       return "neutral";
    if (strategy === "random")        return RealGraphImporter._randomPersona();
    if (strategy === "follower_only") return RealGraphImporter._followerOnlyPersona(profile);

    // Default: "inferred" — bio keyword rules
    const followers = profile.followers || 0;
    const verified  = profile.verified  || false;
    const bio       = (profile.description || "").toLowerCase();

    for (const [pattern, minFollowers, personaId, requireVerified] of BIO_RULES) {
      if (requireVerified && !verified)      continue;
      if (followers < minFollowers)          continue;
      if (pattern.test(bio))                 return personaId;
    }

    // Follower-count fallback
    return RealGraphImporter._followerOnlyPersona(profile);
  }

  static _followerOnlyPersona(profile) {
    const followers = profile.followers || 0;
    const verified  = profile.verified  || false;

    if (verified && followers > 100000) return "neutral_news";
    if (followers > 50000)             return "opinion_columnist";
    if (followers > 10000)             return "lifestyle_influencer";
    if (followers > 1000)              return "startup_founder";
    if (followers > 100)               return "simplifier";
    return "low_education";
  }

  static _randomPersona() {
    const pool = [
      "neutral_news", "investigative_journalist", "politically_biased_left",
      "politically_biased_right", "medical_expert", "tech_expert", "lifestyle_influencer",
      "young_parent", "opinion_columnist", "environmentalist", "gadget_enthusiast",
      "religious_leader", "startup_founder", "sensationalist_news", "simplifier",
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ── Trust estimation ──────────────────────────────────────────────────────

  static estimateTrust(fromProfile, toProfile) {
    let trust = 0.40; // base

    if (fromProfile.verified)                             trust += 0.15;
    if ((fromProfile.followers || 0) > 100000)            trust += 0.15;
    else if ((fromProfile.followers || 0) > 10000)        trust += 0.08;

    // Homophily: same inferred persona → trust boost
    const fromPersona = RealGraphImporter.inferPersona(fromProfile);
    const toPersona   = RealGraphImporter.inferPersona(toProfile);
    if (fromPersona === toPersona) trust += 0.12;

    return Math.min(0.95, Math.max(0.10, trust));
  }

  // ── Article preparation ───────────────────────────────────────────────────

  /**
   * Turn raw article text into the simulation's article format.
   * Uses an LLM call to auto-generate factual yes/no questions.
   */
  static async prepareArticle(articleText, articleId, domain, modelId = "gpt-4o-mini") {
    const systemPrompt = "You are a fact-checking assistant that generates precise yes/no factual questions.";
    const userPrompt   =
      "Read the following article and generate exactly 5 yes/no factual questions " +
      "that test whether key claims are preserved in a retelling. " +
      "Each question must be answerable from the article text alone.\n\n" +
      `Article:\n${articleText}\n\n` +
      'Return ONLY a JSON object: {"questions":["q1","q2",...],"groundTruth":[true,false,...]}  ' +
      "DT_ARTICLE_QA_QUERY";

    let parsed;
    try {
      const raw = await callLLM(modelId, systemPrompt, userPrompt);
      const m   = raw.match(/\{[\s\S]*\}/);
      parsed    = m ? JSON.parse(m[0]) : null;
    } catch (_) {
      parsed = null;
    }

    if (!parsed || !Array.isArray(parsed.questions)) {
      // Fallback: generic questions
      parsed = {
        questions:   ["Does the article discuss a verifiable event?", "Are specific facts stated?",
                      "Is there a named actor in the article?", "Does the article make a claim?",
                      "Is there a date or location mentioned?"],
        groundTruth: [true, true, true, true, true],
      };
    }

    return {
      id:          articleId,
      domain:      domain || "imported",
      title:       articleText.substring(0, 80).replace(/\n/g, " ") + (articleText.length > 80 ? "…" : ""),
      text:        articleText,
      questions:   parsed.questions.slice(0, 5),
      groundTruth: parsed.groundTruth.slice(0, 5),
      _source:     "real_dataset",
    };
  }
}

module.exports = RealGraphImporter;
