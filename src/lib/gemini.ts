import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeFoodImage(imageBuffer: Buffer, mimeType: string, userDescription?: string, isSubtraction: boolean = false) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Analyze this food image and provide the following information in JSON format:
    {
      "food_name": "Name of the food",
      "calories": 123,
      "protein": 10,
      "carbs": 20,
      "fats": 5,
      "description": "Brief description of the meal and estimated portion size"
    }
    ${isSubtraction ? 'IMPORTANT: This image shows LEFTOVER food. Estimate the calories in the LEFTOVERS shown in the image as a POSITIVE number (e.g. 100), but I will subtract it from the total. The description should specify these are leftovers.' : ''}
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

export async function analyzeDay(meals: any[], userProfile: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const mealsSummary = meals.map(m => `- ${m.food_name}: ${m.calories} kcal (P: ${m.protein}g, C: ${m.carbs}g, F: ${m.fats}g) [${m.meal_type}]`).join('\n');

  const prompt = `
    Analyze the following user's meals for the day and provide a high-end nutritional report in JSON format.
    The user's daily calorie goal is ${userProfile?.daily_calorie_goal || 2500} kcal.
    Their goal is: ${userProfile?.goal || 'maintain weight'}.

    Meals Eaten:
    ${mealsSummary}

    Provide the response in EXPLICIT JSON format with this structure:
    {
      "summary": "A 2-sentence sophisticated summary of the day's intake.",
      "metrics": [
        { "label": "Total Energy", "value": "1200 kcal", "status": "Good/High/Low" },
        { "label": "Protein Focus", "value": "Moderate", "status": "Optimized" },
        { "label": "Key Insight", "value": "Good fiber from breakfast", "status": "Positive" }
      ],
      "table": [
        { "nutrient": "Calories", "intake": "1200", "target": "${userProfile?.daily_calorie_goal || 2500}", "unit": "kcal" },
        { "nutrient": "Est. Protein", "intake": "60", "target": "120", "unit": "g" },
        { "nutrient": "Est. Carbs", "intake": "150", "target": "250", "unit": "g" },
        { "nutrient": "Est. Fats", "intake": "40", "target": "70", "unit": "g" }
      ],
      "advice": "One specific tip for tomorrow based on these meals.",
      "stats": {
        "calories": 1200,
        "protein": 60,
        "carbs": 150,
        "fats": 40
      }
    }
    `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Could not parse AI analysis");
}
