const { InferenceClient } = require("@huggingface/inference");

const hf = new InferenceClient(process.env.HF_TOKEN);


// ==========================================
// IMAGE DIMENSIONS
// ==========================================

const getDimensions = (aspectRatio) => {

    switch (aspectRatio) {

        case "Portrait":
            return {
                width: 832,
                height: 1216
            };

        case "Landscape":
            return {
                width: 1216,
                height: 832
            };

        case "Wide":
            return {
                width: 1344,
                height: 768
            };

        case "Square":
        default:
            return {
                width: 1024,
                height: 1024
            };
    }
};


// ==========================================
// GENERATE IMAGE
// ==========================================

const generateImage = async (
    prompt,
    aspectRatio = "Square"
) => {

    console.log("Starting image generation...");

    console.log(
        "Aspect Ratio:",
        aspectRatio
    );


    // Get image dimensions
    const {
        width,
        height
    } = getDimensions(aspectRatio);


    console.log(
        `Image dimensions: ${width}x${height}`
    );


    // Generate image using Hugging Face
    const imageBlob = await hf.textToImage({

        model:
            "black-forest-labs/FLUX.1-schnell",

        inputs:
            prompt,

        parameters: {
            width,
            height
        },

        provider:
            "auto"
    });


    console.log(
        "Image generated successfully."
    );


    // Convert Blob to Buffer
    const buffer =
        Buffer.from(
            await imageBlob.arrayBuffer()
        );


    return buffer;
};


module.exports = {
    generateImage
};