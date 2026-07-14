import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from database import engine, Base
from routers import auth, songs, artists, albums, playlists, library, search, recommendations, users

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup (dev convenience; use Alembic for prod migrations)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Spotify Clone API",
    description="Full-stack music streaming platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (local audio fallback) ───────────────────────────────────────
os.makedirs("static/audio", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── Routers ───────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth.router,            prefix=f"{PREFIX}/auth",            tags=["Auth"])
app.include_router(songs.router,           prefix=f"{PREFIX}/songs",           tags=["Songs"])
app.include_router(artists.router,         prefix=f"{PREFIX}/artists",         tags=["Artists"])
app.include_router(albums.router,          prefix=f"{PREFIX}/albums",          tags=["Albums"])
app.include_router(playlists.router,       prefix=f"{PREFIX}/playlists",       tags=["Playlists"])
app.include_router(library.router,         prefix=f"{PREFIX}/library",         tags=["Library"])
app.include_router(search.router,          prefix=f"{PREFIX}/search",          tags=["Search"])
app.include_router(recommendations.router, prefix=f"{PREFIX}/recommendations", tags=["Recommendations"])
app.include_router(users.router,           prefix=f"{PREFIX}/users",           tags=["Users"])


@app.get("/api/v1/health", tags=["Health"])
def health():
    return {"status": "ok", "message": "Spotify Clone API is running 🎵"}
