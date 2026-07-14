from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    playlists = relationship("Playlist", back_populates="owner", cascade="all, delete-orphan")
    liked_songs = relationship("LikedSong", back_populates="user", cascade="all, delete-orphan")
    listen_history = relationship("ListenHistory", back_populates="user", cascade="all, delete-orphan")
    following = relationship("Follow", foreign_keys="Follow.follower_id", back_populates="follower", cascade="all, delete-orphan")
    followers = relationship("Follow", foreign_keys="Follow.followed_id", back_populates="followed", cascade="all, delete-orphan")


class Artist(Base):
    __tablename__ = "artists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    bio = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    followers_count = Column(Integer, default=0)

    albums = relationship("Album", back_populates="artist")
    songs = relationship("Song", back_populates="artist")


class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    artist_id = Column(Integer, ForeignKey("artists.id"), nullable=False)
    cover_url = Column(String(500), nullable=True)
    release_year = Column(Integer, nullable=True)
    genre = Column(String(100), nullable=True)

    artist = relationship("Artist", back_populates="albums")
    songs = relationship("Song", back_populates="album")


class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    artist_id = Column(Integer, ForeignKey("artists.id"), nullable=False)
    album_id = Column(Integer, ForeignKey("albums.id"), nullable=True)
    duration_sec = Column(Integer, nullable=True)
    audio_url = Column(String(500), nullable=False)
    genre = Column(String(100), nullable=True)
    play_count = Column(Integer, default=0)

    artist = relationship("Artist", back_populates="songs")
    album = relationship("Album", back_populates="songs")
    liked_by = relationship("LikedSong", back_populates="song", cascade="all, delete-orphan")
    in_history = relationship("ListenHistory", back_populates="song", cascade="all, delete-orphan")


class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cover_url = Column(String(500), nullable=True)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="playlists")
    songs = relationship(
        "PlaylistSong",
        back_populates="playlist",
        cascade="all, delete-orphan",
        order_by="PlaylistSong.position",
    )


class PlaylistSong(Base):
    __tablename__ = "playlist_songs"

    playlist_id = Column(Integer, ForeignKey("playlists.id"), primary_key=True)
    song_id = Column(Integer, ForeignKey("songs.id"), primary_key=True)
    position = Column(Integer, nullable=False, default=0)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    playlist = relationship("Playlist", back_populates="songs")
    song = relationship("Song")


class LikedSong(Base):
    __tablename__ = "liked_songs"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    song_id = Column(Integer, ForeignKey("songs.id"), primary_key=True)
    liked_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="liked_songs")
    song = relationship("Song", back_populates="liked_by")


class ListenHistory(Base):
    __tablename__ = "listen_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    listened_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="listen_history")
    song = relationship("Song", back_populates="in_history")


class Follow(Base):
    __tablename__ = "follows"

    follower_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    followed_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    followed_at = Column(DateTime(timezone=True), server_default=func.now())

    follower = relationship("User", foreign_keys=[follower_id], back_populates="following")
    followed = relationship("User", foreign_keys=[followed_id], back_populates="followers")
