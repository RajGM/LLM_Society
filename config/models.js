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
  },
  "claude-sonnet-4-6": {
    provider: "anthropic",
    apiUrl: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-6",
    apiKeyEnv: "ANTHROPIC_API_KEY",
  },
  "ollama-llama3": {
    provider: "ollama",
    apiUrl: "http://localhost:11434/api/chat",
    model: "llama3",
    apiKeyEnv: null,
  },
};

function getModel(modelId) {
  const m = MODELS[modelId];
  if (!m) throw new Error(`Unknown model: ${modelId}. Add it to config/models.js`);
  return m;
}

module.exports = { MODELS, getModel };
