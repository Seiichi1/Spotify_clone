from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter()


@router.get("", response_model=List[schemas.PlaylistResponse])
def list_playlists(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Playlist)
        .options(joinedload(models.Playlist.songs).joinedload(models.PlaylistSong.song).joinedload(models.Song.artist))
        .filter(models.Playlist.user_id == current_user.id)
        .all()
    )


@router.post("", response_model=schemas.PlaylistResponse, status_code=status.HTTP_201_CREATED)
def create_playlist(
    body: schemas.PlaylistCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    playlist = models.Playlist(
        name=body.name,
        description=body.description,
        user_id=current_user.id,
        is_public=body.is_public,
    )
    db.add(playlist)
    db.commit()
    db.refresh(playlist)
    return playlist


@router.get("/{playlist_id}", response_model=schemas.PlaylistResponse)
def get_playlist(playlist_id: int, db: Session = Depends(get_db)):
    playlist = (
        db.query(models.Playlist)
        .options(
            joinedload(models.Playlist.songs)
            .joinedload(models.PlaylistSong.song)
            .joinedload(models.Song.artist)
        )
        .filter(models.Playlist.id == playlist_id)
        .first()
    )
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return playlist


@router.put("/{playlist_id}", response_model=schemas.PlaylistResponse)
def update_playlist(
    playlist_id: int,
    body: schemas.PlaylistUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    playlist = db.query(models.Playlist).filter(
        models.Playlist.id == playlist_id, models.Playlist.user_id == current_user.id
    ).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    if body.name is not None:
        playlist.name = body.name
    if body.description is not None:
        playlist.description = body.description
    if body.is_public is not None:
        playlist.is_public = body.is_public

    db.commit()
    db.refresh(playlist)
    return playlist


@router.delete("/{playlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_playlist(
    playlist_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    playlist = db.query(models.Playlist).filter(
        models.Playlist.id == playlist_id, models.Playlist.user_id == current_user.id
    ).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    db.delete(playlist)
    db.commit()


@router.post("/{playlist_id}/songs", status_code=status.HTTP_201_CREATED)
def add_song_to_playlist(
    playlist_id: int,
    body: schemas.PlaylistSongAdd,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    playlist = db.query(models.Playlist).filter(
        models.Playlist.id == playlist_id, models.Playlist.user_id == current_user.id
    ).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Check song exists
    if not db.query(models.Song).filter(models.Song.id == body.song_id).first():
        raise HTTPException(status_code=404, detail="Song not found")

    # Check not duplicate
    exists = db.query(models.PlaylistSong).filter(
        models.PlaylistSong.playlist_id == playlist_id,
        models.PlaylistSong.song_id == body.song_id,
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="Song already in playlist")

    position = db.query(models.PlaylistSong).filter(
        models.PlaylistSong.playlist_id == playlist_id
    ).count()

    entry = models.PlaylistSong(playlist_id=playlist_id, song_id=body.song_id, position=position)
    db.add(entry)
    db.commit()
    return {"message": "Song added"}


@router.delete("/{playlist_id}/songs/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_song_from_playlist(
    playlist_id: int,
    song_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    playlist = db.query(models.Playlist).filter(
        models.Playlist.id == playlist_id, models.Playlist.user_id == current_user.id
    ).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    entry = db.query(models.PlaylistSong).filter(
        models.PlaylistSong.playlist_id == playlist_id,
        models.PlaylistSong.song_id == song_id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Song not in playlist")

    db.delete(entry)
    db.commit()
