const { InferenceClient } = require("@huggingface/inference");

const hf = new InferenceClient(process.env.HF_TOKEN);

const enhancePrompt = async (userPrompt) => {
    const response = await hf.chatCompletion({
        model: "Qwen/Qwen3-4B-Thinking-2507",
        messages: [
            {
                role: "system",
                content:
                    "You are an expert AI image prompt engineer. " +
                    "Transform simple user prompts into detailed prompts " +
                    "for AI image generation. Include subject, environment, " +
                    "lighting, composition, colors, atmosphere and artistic style. " +
                    "Return only the enhanced prompt."
            },
            {
                role: "user",
                content: userPrompt
            }
        ],
        max_tokens: 300,
        temperature: 0.7
    });

    return response.choices[0].message.content;
};

module.exports = {
    enhancePrompt
};