# AI model configurations
OPENAI_CHAT_MODEL = "gpt-4o-mini"
OPENAI_EMBEDDING_MODEL = "text-embedding-ada-002"
OPENAI_MODEL_PRICING_USD = {
    "gpt-4o-mini": {
        "one_million_input_tokens": 0.15,
        "one_million_output_tokens": 0.60,
    },
    "text-embedding-ada-002": {
        "one_million_input_tokens": 0.10,
        "one_million_output_tokens": 0.10,
    },
}
