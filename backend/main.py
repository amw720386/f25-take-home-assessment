from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import httpx
from uuid import uuid4
import uvicorn

import os
from dotenv import load_dotenv

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

class WeatherRequest(BaseModel):
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str
    
load_dotenv()
KEY = os.getenv("WEATHER_API_KEY")
URL = f"https://api.weatherstack.com/current?access_key={KEY}"

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    query = {"access_key":KEY,
             "query":request.location, }

    async with httpx.AsyncClient() as client:
        response = await client.get(URL, params=query)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="WeatherStack API error")
        weather_data = response.json()
        if "error" in weather_data:
            raise HTTPException(status_code=400, detail=weather_data["error"].get("info", "WeatherStack API error"))
        
    data = response.json()

    data["request"]["notes"] = request.notes

    weather_id = str(uuid4())
    weather_storage[weather_id] = data

    return {"id":weather_id}

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)