from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ── Artist ────────────────────────────────────────────────────────────────────
class ArtistResponse(BaseModel):
    id: int
    name: str
    bio: Optional[str] = None
    image_url: Optional[str] = None
    followers_count: int = 0

    model_config = {"from_attributes": True}


# ── Album ─────────────────────────────────────────────────────────────────────
class AlbumResponse(BaseModel):
    id: int
    title: str
    artist_id: int
    cover_url: Optional[str] = None
    release_year: Optional[int] = None
    genre: Optional[str] = None
    artist: Optional[ArtistResponse] = None

    model_config = {"from_attributes": True}


# ── Song ──────────────────────────────────────────────────────────────────────
class SongResponse(BaseModel):
    id: int
    title: str
    artist_id: int
    album_id: Optional[int] = None
    duration_sec: Optional[int] = None
    audio_url: str
    genre: Optional[str] = None
    play_count: int = 0
    is_liked: bool = False
    artist: Optional[ArtistResponse] = None
    album: Optional[AlbumResponse] = None

    model_config = {"from_attributes": True}


# ── Playlist ──────────────────────────────────────────────────────────────────
class PlaylistCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = True


class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


class PlaylistSongAdd(BaseModel):
    song_id: int


class PlaylistSongResponse(BaseModel):
    song: SongResponse
    position: int
    added_at: datetime

    model_config = {"from_attributes": True}


class PlaylistResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    user_id: int
    cover_url: Optional[str] = None
    is_public: bool
    created_at: datetime
    songs: List[PlaylistSongResponse] = []

    model_config = {"from_attributes": True}


# ── Search ────────────────────────────────────────────────────────────────────
class SearchResponse(BaseModel):
    songs: List[SongResponse]
    artists: List[ArtistResponse]
    albums: List[AlbumResponse]


# ── User profile update ───────────────────────────────────────────────────────
class UserUpdate(BaseModel):
    username: Optional[str] = None
    avatar_url: Optional[str] = None
