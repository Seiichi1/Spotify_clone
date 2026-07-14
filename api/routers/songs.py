from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from database import get_db
import models, schemas
from auth import get_current_user, get_current_user_optional

router = APIRouter()


def _enrich(song: models.Song, current_user: Optional[models.User], db: Session) -> dict:
    """Attach is_liked field to a song."""
    is_liked = False
    if current_user:
        is_liked = (
            db.query(models.LikedSong)
            .filter(
                models.LikedSong.user_id == current_user.id,
                models.LikedSong.song_id == song.id,
            )
            .first()
            is not None
        )
    data = {c.name: getattr(song, c.name) for c in song.__table__.columns}
    data["is_liked"] = is_liked
    data["artist"] = song.artist
    data["album"] = song.album
    return data


@router.get("", response_model=List[schemas.SongResponse])
def list_songs(
    skip: int = 0,
    limit: int = Query(50, le=100),
    genre: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    q = db.query(models.Song).options(
        joinedload(models.Song.artist), joinedload(models.Song.album)
    )
    if genre:
        q = q.filter(models.Song.genre.ilike(f"%{genre}%"))
    songs = q.offset(skip).limit(limit).all()
    return [_enrich(s, current_user, db) for s in songs]


@router.get("/{song_id}", response_model=schemas.SongResponse)
def get_song(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    song = (
        db.query(models.Song)
        .options(joinedload(models.Song.artist), joinedload(models.Song.album))
        .filter(models.Song.id == song_id)
        .first()
    )
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    # Increment play count
    song.play_count += 1
    db.commit()

    return _enrich(song, current_user, db)


@router.post("/{song_id}/play")
def record_play(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Record a listen event for history and recommendations."""
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    entry = models.ListenHistory(user_id=current_user.id, song_id=song_id)
    db.add(entry)
    song.play_count += 1
    db.commit()
    return {"message": "Recorded"}
