from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter()


def _enrich_song(song: models.Song, user_id: int, db: Session) -> dict:
    is_liked = db.query(models.LikedSong).filter(
        models.LikedSong.user_id == user_id,
        models.LikedSong.song_id == song.id,
    ).first() is not None
    data = {c.name: getattr(song, c.name) for c in song.__table__.columns}
    data["is_liked"] = is_liked
    data["artist"] = song.artist
    data["album"] = song.album
    return data


@router.get("/liked", response_model=List[schemas.SongResponse])
def get_liked_songs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    liked = (
        db.query(models.LikedSong)
        .filter(models.LikedSong.user_id == current_user.id)
        .order_by(models.LikedSong.liked_at.desc())
        .all()
    )
    songs = []
    for entry in liked:
        song = (
            db.query(models.Song)
            .options(joinedload(models.Song.artist), joinedload(models.Song.album))
            .filter(models.Song.id == entry.song_id)
            .first()
        )
        if song:
            songs.append(_enrich_song(song, current_user.id, db))
    return songs


@router.post("/like/{song_id}", status_code=status.HTTP_201_CREATED)
def like_song(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not db.query(models.Song).filter(models.Song.id == song_id).first():
        raise HTTPException(status_code=404, detail="Song not found")

    exists = db.query(models.LikedSong).filter(
        models.LikedSong.user_id == current_user.id,
        models.LikedSong.song_id == song_id,
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="Already liked")

    db.add(models.LikedSong(user_id=current_user.id, song_id=song_id))
    db.commit()
    return {"message": "Liked", "song_id": song_id}


@router.delete("/like/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
def unlike_song(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    entry = db.query(models.LikedSong).filter(
        models.LikedSong.user_id == current_user.id,
        models.LikedSong.song_id == song_id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Song not liked")
    db.delete(entry)
    db.commit()


@router.get("/history", response_model=List[schemas.SongResponse])
def get_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    history = (
        db.query(models.ListenHistory)
        .filter(models.ListenHistory.user_id == current_user.id)
        .order_by(models.ListenHistory.listened_at.desc())
        .limit(limit)
        .all()
    )
    seen, songs = set(), []
    for entry in history:
        if entry.song_id in seen:
            continue
        seen.add(entry.song_id)
        song = (
            db.query(models.Song)
            .options(joinedload(models.Song.artist), joinedload(models.Song.album))
            .filter(models.Song.id == entry.song_id)
            .first()
        )
        if song:
            songs.append(_enrich_song(song, current_user.id, db))
    return songs
