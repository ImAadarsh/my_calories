import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeFoodImage(imageBuffer: Buffer, mimeType: string, userDescription?: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Analyze this food image and provide the following information in JSON format:
    {
      "food_name": "Name of the food",
      "calories": 123,
      "description": "Brief description of the meal and estimated portion size"
    }
    ${userDescription ? `The user also provided this additional context: "${userDescription}". Use this to improve your accuracy.` : ''}
    If there is no food in the image, return an error message.
  `;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType,
            },
        },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up JSON response if AI includes markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Could not parse AI response");
}
