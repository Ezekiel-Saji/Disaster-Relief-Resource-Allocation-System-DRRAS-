import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  try {
    const { weatherData, areaName } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }

    if (!weatherData || weatherData.length === 0) {
      return NextResponse.json(
        { error: "No weather data provided for prediction." },
        { status: 400 }
      );
    }

    const prompt = `
      You are an expert disaster prediction AI. Based on the following historical and current weather data for the area "${areaName}", predict the likelihood and type of potential natural disasters (e.g., Flood, Hurricane, Landslide, Drought, etc.).

      Weather Data (Daily Observations):
      ${weatherData.map((d: any) => `- Date: ${d.observation_date}, Temp: ${d.temperature}°C, Humidity: ${d.humidity}%, Pressure: ${d.pressure}hPa, Rainfall: ${d.rainfall}mm, Wind Speed: ${d.wind_speed}km/h`).join("\n")}

      Provide your prediction in the following JSON format ONLY:
      {
        "predicted_disaster_type": "string",
        "risk_score": number (0 to 10),
        "confidence_level": number (0 to 100),
        "predicted_date": "YYYY-MM-DD",
        "reasoning": "A concise explanation of why this prediction was made based on the data trends."
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting in the response
    const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const prediction = JSON.parse(jsonString);

    return NextResponse.json(prediction);
  } catch (error: any) {
    console.error("Gemini Prediction Error:", error);
    return NextResponse.json(
      { error: "Failed to generate prediction: " + error.message },
      { status: 500 }
    );
  }
}
