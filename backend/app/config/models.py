# AI model configurations and cost limits
MAX_COST_PER_USER_PER_DAY_USD = 0.01
OPENAI_MODEL_TO_USE = "gpt-4o-mini"
OPENAI_MODEL_PRICING_USD = {
    "gpt-4o-mini": {
        "one_million_input_tokens": 0.60,
        "one_million_output_tokens": 2.40,
    },
    "gpt-4.1-mini": {
        "one_million_input_tokens": 0.40,
        "one_million_output_tokens": 1.60,
    },
}
EMBEDDING_MODEL_TO_USE = "intfloat/e5-large-v2"
