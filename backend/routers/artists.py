from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from database import get_db
import models, schemas

router = APIRouter()


@router.get("", response_model=List[schemas.ArtistResponse])
def list_artists(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(models.Artist).offset(skip).limit(limit).all()


@router.get("/{artist_id}", response_model=schemas.ArtistResponse)
def get_artist(artist_id: int, db: Session = Depends(get_db)):
    artist = db.query(models.Artist).filter(models.Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist


@router.get("/{artist_id}/songs", response_model=List[schemas.SongResponse])
def get_artist_songs(artist_id: int, db: Session = Depends(get_db)):
    songs = (
        db.query(models.Song)
        .options(joinedload(models.Song.artist), joinedload(models.Song.album))
        .filter(models.Song.artist_id == artist_id)
        .all()
    )
    return [
        {**{c.name: getattr(s, c.name) for c in s.__table__.columns}, "is_liked": False, "artist": s.artist, "album": s.album}
        for s in songs
    ]


@router.get("/{artist_id}/albums", response_model=List[schemas.AlbumResponse])
def get_artist_albums(artist_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Album)
        .options(joinedload(models.Album.artist))
        .filter(models.Album.artist_id == artist_id)
        .all()
    )
