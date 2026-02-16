import os
import requests
from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

SPACE_DB_URL = os.getenv("SPACE_DB_URL")

app = FastAPI(title="Astra AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="backend/static"), name="static")

def normalize_planet(p):
    return {
        "name": p.get("name") or "Unknown",
        "host_star": p.get("host_star") or "Unknown",
        "radius_earth": p.get("radius_earth"),
        "mass_earth": p.get("mass_earth"),
        "classification": p.get("classification") or "Unknown"
    }

@app.get("/")
def home():
    return FileResponse("backend/static/index.html")

@app.get("/suggestions")
def suggestions():
    r = requests.get(f"{SPACE_DB_URL}/exoplanets?limit=12")
    planets = r.json()
    return [normalize_planet(p) for p in planets][:8]

@app.get("/search")
def search(q: str = Query(...)):
    r = requests.get(f"{SPACE_DB_URL}/exoplanets?limit=100")
    planets = r.json()
    normalized = [normalize_planet(p) for p in planets]
    return [p for p in normalized if q.lower() in p["name"].lower()]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.head("/health")
def health_head():
    return Response(status_code=200)
