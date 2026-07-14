from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from database import get_db
import models, schemas

router = APIRouter()


@router.get("", response_model=schemas.SearchResponse)
def search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    term = f"%{q}%"

    songs = (
        db.query(models.Song)
        .options(joinedload(models.Song.artist), joinedload(models.Song.album))
        .filter(models.Song.title.ilike(term))
        .limit(20)
        .all()
    )

    artists = (
        db.query(models.Artist)
        .filter(models.Artist.name.ilike(term))
        .limit(10)
        .all()
    )

    albums = (
        db.query(models.Album)
        .options(joinedload(models.Album.artist))
        .filter(models.Album.title.ilike(term))
        .limit(10)
        .all()
    )

    song_list = [
        {**{c.name: getattr(s, c.name) for c in s.__table__.columns}, "is_liked": False, "artist": s.artist, "album": s.album}
        for s in songs
    ]

    return {"songs": song_list, "artists": artists, "albums": albums}
