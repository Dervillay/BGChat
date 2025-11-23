# AI model configurations
OPENAI_CHAT_MODEL = "gpt-4o-mini"
OPENAI_EMBEDDING_MODEL = "text-embedding-ada-002"
OPENAI_MODEL_PRICING_USD = {
    "gpt-4o-mini": {
        "one_million_input_tokens": 0.15,
        "one_million_output_tokens": 0.60,
        "one_thousand_web_searches": 10.00,
    },
    "gpt-4.1-mini": {
        "one_million_input_tokens": 0.40,
        "one_million_output_tokens": 1.60,
        "one_thousand_web_searches": 10.00,
    },
    "gpt-5-mini": {
        "one_million_input_tokens": 0.25,
        "one_million_output_tokens": 2.00,
        "one_thousand_web_searches": 10.00,
    },
    "text-embedding-ada-002": {
        "one_million_input_tokens": 0.10,
        "one_million_output_tokens": 0.0,  # Embedding models don't have output tokens
    },
}
