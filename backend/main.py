import os
import time
import requests
from functools import lru_cache
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# ======================================
# CONFIG
# ======================================

SPACE_DB_API = os.getenv(
    "SPACE_DB_API",
    "https://space-object-database.onrender.com"
)

REQUEST_TIMEOUT = 30

# ======================================
# APP INIT
# ======================================

app = FastAPI(title="Astra AI - Public Space Portal")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="backend/static"), name="static")

# ======================================
# HEALTH CHECK
# ======================================

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}

# ======================================
# ROOT PAGE
# ======================================

@app.api_route("/", methods=["GET", "HEAD"])
def home():
    return FileResponse("backend/static/index.html")

# ======================================
# SAFE FETCH WITH RETRY
# ======================================

def fetch_from_space_db(endpoint: str, params: dict = None):
    url = f"{SPACE_DB_API}{endpoint}"

    for attempt in range(3):
        try:
            r = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.RequestException:
            if attempt < 2:
                time.sleep(3)
                continue
            raise HTTPException(
                status_code=504,
                detail="Space database temporarily unavailable."
            )

# ======================================
# AI INTELLIGENCE
# ======================================

def habitability_score(p: dict):
    score = 0
    r = p.get("radius_earth")
    m = p.get("mass_earth")
    p_days = p.get("orbital_period_days")

    if r and 0.8 <= r <= 1.5:
        score += 40
    if m and 0.5 <= m <= 5:
        score += 30
    if p_days and 200 <= p_days <= 400:
        score += 30

    return score

def rank(planets):
    for p in planets:
        p["habitability_score"] = habitability_score(p)
    return sorted(planets, key=lambda x: x["habitability_score"], reverse=True)

# ======================================
# CACHE
# ======================================

@lru_cache(maxsize=32)
def cached_exoplanets(limit: int):
    return fetch_from_space_db("/exoplanets", {"limit": limit})

# ======================================
# API ROUTES
# ======================================

@app.get("/astra/exoplanets")
def ranked_exoplanets(limit: int = Query(20, ge=1, le=200)):
    planets = cached_exoplanets(limit)
    return rank(planets)

@app.get("/astra/search")
def search(q: str):
    planets = fetch_from_space_db("/exoplanets/search", {"q": q})
    return rank(planets)

@app.get("/object/{name}")
def object_detail(name: str):
    planets = fetch_from_space_db("/exoplanets/search", {"q": name})
    if not planets:
        raise HTTPException(status_code=404, detail="Object not found")

    planet = planets[0]
    planet["habitability_score"] = habitability_score(planet)
    return planet
