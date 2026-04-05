import requests
import os
from datetime import date, timedelta
from dotenv import load_dotenv

# ----------------------------
# LOAD ENV
# ----------------------------
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

TABLE_URL = f"{SUPABASE_URL}/rest/v1/weather_data"

# ----------------------------
# AREA CONFIG
# ----------------------------
AREA_ID = 5
LATITUDE = 9.633690743720319
LONGITUDE = 76.48053215366119
# ----------------------------
# DATE RANGE (PAST 14 DAYS)
# ----------------------------
end_date = date.today() - timedelta(days=1)
start_date = end_date - timedelta(days=13)

# ----------------------------
# FETCH WEATHER DATA
# ----------------------------
weather_api = "https://archive-api.open-meteo.com/v1/archive"

params = {
    "latitude": LATITUDE,
    "longitude": LONGITUDE,
    "start_date": start_date.isoformat(),
    "end_date": end_date.isoformat(),
    "daily": ",".join([
        "temperature_2m_mean",
        "precipitation_sum",
        "wind_speed_10m_max",
        "relative_humidity_2m_mean",
        "surface_pressure_mean"
    ]),
    "timezone": "auto"
}

print("Fetching weather data...")
response = requests.get(weather_api, params=params)
daily = response.json()["daily"]

# ----------------------------
# SUPABASE HEADERS
# ----------------------------
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

print("Uploading to Supabase...")

# ----------------------------
# INSERT EACH DAY
# ----------------------------
for i in range(len(daily["time"])):

    payload = {
        "area_id": AREA_ID,
        "rainfall": daily["precipitation_sum"][i],
        "humidity": daily["relative_humidity_2m_mean"][i],
        "wind_speed": daily["wind_speed_10m_max"][i],
        "temperature": daily["temperature_2m_mean"][i],
        "observation_date": daily["time"][i],
        "pressure": daily["surface_pressure_mean"][i]
    }

    res = requests.post(TABLE_URL, json=payload, headers=headers)

    if res.status_code not in [200, 201]:
        print("Insert failed:", res.text)

print("✅ Past 14 days weather inserted successfully.")