const https = require("https");
const http = require("http");
const { getModel } = require("../config/models");

// In dry-run mode every LLM call is intercepted by keyword detection on the userPrompt.
// Each call type embeds a unique sentinel so the interceptor can return the right mock.
function callLLMDryRun(systemPrompt, userPrompt) {
  // QA auditor (Auditor.js)
  if (userPrompt.includes("Return only the JSON")) {
    const count = (userPrompt.match(/^\d+\./gm) || []).length || 5;
    return Promise.resolve(JSON.stringify({ answers: Array(count).fill(1) }));
  }
  // Belief alignment query (BeliefEngine.js)
  if (userPrompt.includes("BELIEF_ALIGNMENT_QUERY")) {
    return Promise.resolve(JSON.stringify({ alignment: 0.5 }));
  }
  // Belief update query (BeliefEngine.js)
  if (userPrompt.includes("BELIEF_UPDATE_QUERY")) {
    return Promise.resolve(JSON.stringify({ stance: "Neutral stance maintained.", confidence: 0.5 }));
  }
  // Frame analysis query (FrameAuditor.js)
  if (userPrompt.includes("FRAME_ANALYSIS_QUERY")) {
    return Promise.resolve(
      JSON.stringify({ frameShift: 0.1, sentiment: 0.0, sentimentDelta: 0.0, newClaims: [], coherenceScore: 0.9 })
    );
  }
  // Digital twin article QA generation (RealGraphImporter.prepareArticle)
  if (userPrompt.includes("DT_ARTICLE_QA_QUERY")) {
    return Promise.resolve(JSON.stringify({
      questions: [
        "Does the article discuss a verifiable event?",
        "Are specific numerical facts stated in the article?",
        "Is there a named person or organization mentioned?",
        "Does the article make a factual claim that can be checked?",
        "Is there a location or date referenced in the article?"
      ],
      groundTruth: [true, true, true, true, true],
    }));
  }
  // Node rewrite: return the article portion (last paragraph after blank line)
  const parts = userPrompt.split("\n\n");
  return Promise.resolve(parts[parts.length - 1].trim());
}

// Generic LLM caller — returns the assistant message string
async function callLLM(modelId, systemPrompt, userPrompt) {
  if (process.env.DRY_RUN === "1") {
    return callLLMDryRun(systemPrompt, userPrompt);
  }

  const modelCfg = getModel(modelId);

  if (modelCfg.provider === "openai") {
    return callOpenAI(modelCfg, systemPrompt, userPrompt);
  } else if (modelCfg.provider === "anthropic") {
    return callAnthropic(modelCfg, systemPrompt, userPrompt);
  } else if (modelCfg.provider === "ollama") {
    return callOllama(modelCfg, systemPrompt, userPrompt);
  }
  throw new Error(`Unsupported provider: ${modelCfg.provider}`);
}

function callOpenAI(cfg, systemPrompt, userPrompt) {
  const apiKey = process.env[cfg.apiKeyEnv];
  if (!apiKey) throw new Error(`Env var ${cfg.apiKeyEnv} not set`);

  const body = JSON.stringify({
    model: cfg.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  return httpPost(cfg.apiUrl, body, {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  }).then((res) => res.choices[0].message.content.trim());
}

function callAnthropic(cfg, systemPrompt, userPrompt) {
  const apiKey = process.env[cfg.apiKeyEnv];
  if (!apiKey) throw new Error(`Env var ${cfg.apiKeyEnv} not set`);

  const body = JSON.stringify({
    model: cfg.model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return httpPost(cfg.apiUrl, body, {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  }).then((res) => res.content[0].text.trim());
}

function callOllama(cfg, systemPrompt, userPrompt) {
  const body = JSON.stringify({
    model: cfg.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: false,
  });

  return httpPost(cfg.apiUrl, body, {
    "Content-Type": "application/json",
  }).then((res) => res.message.content.trim());
}

function httpPost(urlStr, body, headers) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === "https:" ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method: "POST",
      headers: { ...headers, "Content-Length": Buffer.byteLength(body) },
    };

    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`JSON parse error: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = { callLLM };
