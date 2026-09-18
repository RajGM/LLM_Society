// Model registry — add any OpenAI-compatible endpoint here
const MODELS = {
  "gpt-4o": {
    provider: "openai",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o",
    apiKeyEnv: "OPENAI_API_KEY",
  },
  "gpt-4o-mini": {
    provider: "openai",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    apiKeyEnv: "OPENAI_API_KEY",
  }
};

function getModel(modelId) {
  const m = MODELS[modelId];
  if (!m) throw new Error(`Unknown model: ${modelId}. Add it to config/models.js`);
  return m;
}

module.exports = { MODELS, getModel };
