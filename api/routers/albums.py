from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from database import get_db
import models, schemas

router = APIRouter()


@router.get("", response_model=List[schemas.AlbumResponse])
def list_albums(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return (
        db.query(models.Album)
        .options(joinedload(models.Album.artist))
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{album_id}", response_model=schemas.AlbumResponse)
def get_album(album_id: int, db: Session = Depends(get_db)):
    album = (
        db.query(models.Album)
        .options(joinedload(models.Album.artist), joinedload(models.Album.songs))
        .filter(models.Album.id == album_id)
        .first()
    )
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    return album


@router.get("/{album_id}/songs", response_model=List[schemas.SongResponse])
def get_album_songs(album_id: int, db: Session = Depends(get_db)):
    songs = (
        db.query(models.Song)
        .options(joinedload(models.Song.artist), joinedload(models.Song.album))
        .filter(models.Song.album_id == album_id)
        .all()
    )
    return [
        {**{c.name: getattr(s, c.name) for c in s.__table__.columns}, "is_liked": False, "artist": s.artist, "album": s.album}
        for s in songs
    ]
