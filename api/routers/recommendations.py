from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from database import get_db
import models, schemas
from auth import get_current_user_optional

router = APIRouter()


@router.get("", response_model=List[schemas.SongResponse])
def get_recommendations(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """
    Simple genre-based recommendations:
    1. Find the most-listened genre from user history.
    2. Return songs in that genre the user hasn't heard recently.
    Falls back to most-played songs overall if no history.
    """
    # Get genres from listen history (only if user is authenticated)
    history_song_ids = []
    if current_user:
        history_song_ids = [
            h.song_id
            for h in db.query(models.ListenHistory)
            .filter(models.ListenHistory.user_id == current_user.id)
            .order_by(models.ListenHistory.listened_at.desc())
            .limit(50)
            .all()
        ]

    if history_song_ids:
        # Tally genres
        genre_count: dict[str, int] = {}
        for sid in history_song_ids:
            song = db.query(models.Song).filter(models.Song.id == sid).first()
            if song and song.genre:
                genre_count[song.genre] = genre_count.get(song.genre, 0) + 1

        if genre_count:
            top_genre = max(genre_count, key=genre_count.get)
            songs = (
                db.query(models.Song)
                .options(joinedload(models.Song.artist), joinedload(models.Song.album))
                .filter(
                    models.Song.genre == top_genre,
                    ~models.Song.id.in_(history_song_ids[-10:]),
                )
                .limit(limit)
                .all()
            )
            if songs:
                return [
                    {**{c.name: getattr(s, c.name) for c in s.__table__.columns}, "is_liked": False, "artist": s.artist, "album": s.album}
                    for s in songs
                ]

    # Fallback: most played songs
    songs = (
        db.query(models.Song)
        .options(joinedload(models.Song.artist), joinedload(models.Song.album))
        .order_by(models.Song.play_count.desc())
        .limit(limit)
        .all()
    )
    return [
        {**{c.name: getattr(s, c.name) for c in s.__table__.columns}, "is_liked": False, "artist": s.artist, "album": s.album}
        for s in songs
    ]
