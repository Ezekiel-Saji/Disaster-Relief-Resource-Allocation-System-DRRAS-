import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET() {
  try {
    if (!OPENWEATHER_API_KEY) {
      console.warn("OPENWEATHER_API_KEY is missing. Returning existing DB data only.");
    }

    // 1. Fetch all areas
    const { data: areas, error: areaError } = await supabase.from("area").select("*");
    if (areaError) throw areaError;

    const today = new Date().toISOString().split("T")[0];
    const results = [];

    // 2. Process each area
    for (const area of areas || []) {
      // Check if today's record exists
      const { data: existing, error: checkError } = await supabase
        .from("weather_data")
        .select("*")
        .eq("area_id", area.area_id)
        .eq("observation_date", today)
        .maybeSingle();

      if (existing) {
        results.push({ ...existing, area_name: area.area_name });
        continue;
      }

      // If missing and we have API key, fetch and save
      if (OPENWEATHER_API_KEY && area.latitude && area.longitude) {
        try {
          const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${area.latitude}&lon=${area.longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
          );
          const weather = await weatherRes.json();

          if (weatherRes.ok) {
            const newRecord = {
              area_id: area.area_id,
              temperature: weather.main.temp,
              humidity: weather.main.humidity,
              pressure: weather.main.pressure,
              wind_speed: weather.wind.speed * 3.6, // m/s to km/h
              rainfall: weather.rain ? weather.rain["1h"] || 0 : 0,
              observation_date: today,
            };

            const { data: inserted, error: insertError } = await supabase
              .from("weather_data")
              .insert(newRecord)
              .select()
              .single();

            if (!insertError) {
              results.push({ ...inserted, area_name: area.area_name });
              continue;
            } else {
              console.error(`Insert failed for ${area.area_name}:`, insertError);
            }
          }
        } catch (fetchErr) {
          console.error(`Fetch failed for ${area.area_name}:`, fetchErr);
        }
      }
    }

    return NextResponse.json({ results, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error("Weather Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
