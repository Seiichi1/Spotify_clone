"""
Seed script — populates the DB with 5 artists, 10 albums, 30 songs, and 1 demo user.
Audio: royalty-free Creative Commons tracks from the Free Music Archive & Internet Archive.
Run: python seed.py
"""

from database import SessionLocal, engine, Base
import models
from auth import hash_password

Base.metadata.create_all(bind=engine)

# ── Royalty-free audio URLs (Creative Commons) ────────────────────────────────
AUDIO = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
]

# Cover images (realistic photos via Picsum)
COVERS = [
    "https://picsum.photos/seed/album1/400/400",
    "https://picsum.photos/seed/album2/400/400",
    "https://picsum.photos/seed/album3/400/400",
    "https://picsum.photos/seed/album4/400/400",
    "https://picsum.photos/seed/album5/400/400",
    "https://picsum.photos/seed/album6/400/400",
    "https://picsum.photos/seed/album7/400/400",
    "https://picsum.photos/seed/album8/400/400",
    "https://picsum.photos/seed/album9/400/400",
    "https://picsum.photos/seed/album10/400/400",
]

ARTIST_IMAGES = [
    "https://picsum.photos/seed/artist1/300/300",
    "https://picsum.photos/seed/artist2/300/300",
    "https://picsum.photos/seed/artist3/300/300",
    "https://picsum.photos/seed/artist4/300/300",
    "https://picsum.photos/seed/artist5/300/300",
]

SEED_DATA = {
    "artists": [
        {"name": "The Night Owls",   "bio": "Indie electronic duo blending lo-fi beats with dreamy vocals.", "genre": "Indie Electronic"},
        {"name": "Luna Waves",       "bio": "Ambient jazz trio creating soundscapes from ocean to cosmos.",   "genre": "Ambient Jazz"},
        {"name": "Steel Echo",       "bio": "Alternative rock band with a raw, distorted sound.",             "genre": "Alternative Rock"},
        {"name": "Neon Drift",       "bio": "Synthwave project inspired by 80s retrofuturism.",               "genre": "Synthwave"},
        {"name": "Coastal Winds",    "bio": "Folk acoustic project celebrating nature and storytelling.",      "genre": "Folk Acoustic"},
    ],
    "albums": [
        # Night Owls
        {"title": "Midnight Sessions", "artist_idx": 0, "year": 2023, "genre": "Indie Electronic"},
        {"title": "City Lights",        "artist_idx": 0, "year": 2022, "genre": "Indie Electronic"},
        # Luna Waves
        {"title": "Ocean Floor",        "artist_idx": 1, "year": 2023, "genre": "Ambient Jazz"},
        {"title": "Moonrise",           "artist_idx": 1, "year": 2022, "genre": "Ambient Jazz"},
        # Steel Echo
        {"title": "Shattered Glass",    "artist_idx": 2, "year": 2023, "genre": "Alternative Rock"},
        {"title": "Iron Curtain",       "artist_idx": 2, "year": 2021, "genre": "Alternative Rock"},
        # Neon Drift
        {"title": "Retrowave",          "artist_idx": 3, "year": 2023, "genre": "Synthwave"},
        {"title": "Future Past",        "artist_idx": 3, "year": 2022, "genre": "Synthwave"},
        # Coastal Winds
        {"title": "Driftwood",          "artist_idx": 4, "year": 2023, "genre": "Folk Acoustic"},
        {"title": "Seaside Stories",    "artist_idx": 4, "year": 2022, "genre": "Folk Acoustic"},
    ],
    "songs": [
        # Midnight Sessions (album 0)
        {"title": "Night Owl", "album_idx": 0, "artist_idx": 0, "duration": 214, "audio_idx": 0},
        {"title": "Amphitheater", "album_idx": 0, "artist_idx": 0, "duration": 198, "audio_idx": 1},
        {"title": "City Pulse", "album_idx": 0, "artist_idx": 0, "duration": 187, "audio_idx": 2},
        # City Lights (album 1)
        {"title": "Neon Alley", "album_idx": 1, "artist_idx": 0, "duration": 223, "audio_idx": 3},
        {"title": "After Midnight", "album_idx": 1, "artist_idx": 0, "duration": 205, "audio_idx": 4},
        {"title": "Streetlamp", "album_idx": 1, "artist_idx": 0, "duration": 176, "audio_idx": 0},
        # Ocean Floor (album 2)
        {"title": "Deep Currents", "album_idx": 2, "artist_idx": 1, "duration": 310, "audio_idx": 1},
        {"title": "Tidal Drift", "album_idx": 2, "artist_idx": 1, "duration": 285, "audio_idx": 2},
        {"title": "Abyssal Plain", "album_idx": 2, "artist_idx": 1, "duration": 340, "audio_idx": 3},
        # Moonrise (album 3)
        {"title": "Lunar Lullaby", "album_idx": 3, "artist_idx": 1, "duration": 260, "audio_idx": 4},
        {"title": "Crescent", "album_idx": 3, "artist_idx": 1, "duration": 295, "audio_idx": 0},
        {"title": "Full Moon Jam", "album_idx": 3, "artist_idx": 1, "duration": 320, "audio_idx": 1},
        # Shattered Glass (album 4)
        {"title": "Broken Signal", "album_idx": 4, "artist_idx": 2, "duration": 197, "audio_idx": 2},
        {"title": "Static", "album_idx": 4, "artist_idx": 2, "duration": 215, "audio_idx": 3},
        {"title": "Feedback Loop", "album_idx": 4, "artist_idx": 2, "duration": 230, "audio_idx": 4},
        # Iron Curtain (album 5)
        {"title": "Cold War Blues", "album_idx": 5, "artist_idx": 2, "duration": 243, "audio_idx": 0},
        {"title": "Steel Rain", "album_idx": 5, "artist_idx": 2, "duration": 208, "audio_idx": 1},
        {"title": "The Wall", "album_idx": 5, "artist_idx": 2, "duration": 195, "audio_idx": 2},
        # Retrowave (album 6)
        {"title": "Drive Forever", "album_idx": 6, "artist_idx": 3, "duration": 254, "audio_idx": 3},
        {"title": "Sunset Boulevard", "album_idx": 6, "artist_idx": 3, "duration": 237, "audio_idx": 4},
        {"title": "Neon Horizon", "album_idx": 6, "artist_idx": 3, "duration": 261, "audio_idx": 0},
        # Future Past (album 7)
        {"title": "Time Capsule", "album_idx": 7, "artist_idx": 3, "duration": 280, "audio_idx": 1},
        {"title": "Retro Future", "album_idx": 7, "artist_idx": 3, "duration": 247, "audio_idx": 2},
        {"title": "Circuit Dreams", "album_idx": 7, "artist_idx": 3, "duration": 233, "audio_idx": 3},
        # Driftwood (album 8)
        {"title": "Shoreline", "album_idx": 8, "artist_idx": 4, "duration": 201, "audio_idx": 4},
        {"title": "Pine & Salt", "album_idx": 8, "artist_idx": 4, "duration": 188, "audio_idx": 0},
        {"title": "Tide Pools", "album_idx": 8, "artist_idx": 4, "duration": 215, "audio_idx": 1},
        # Seaside Stories (album 9)
        {"title": "Harbour Light", "album_idx": 9, "artist_idx": 4, "duration": 224, "audio_idx": 2},
        {"title": "Fisherman's Lament", "album_idx": 9, "artist_idx": 4, "duration": 196, "audio_idx": 3},
        {"title": "Kelp Forest", "album_idx": 9, "artist_idx": 4, "duration": 239, "audio_idx": 4},
    ],
}


def seed():
    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(models.Artist).count() > 0:
            print("[INFO] Database already seeded. Skipping.")
            return

        print("[INFO] Seeding database...")

        # Create artists
        artist_objs = []
        for i, a in enumerate(SEED_DATA["artists"]):
            artist = models.Artist(
                name=a["name"],
                bio=a["bio"],
                image_url=ARTIST_IMAGES[i],
                followers_count=1000 * (i + 1),
            )
            db.add(artist)
            artist_objs.append(artist)
        db.flush()

        # Create albums
        album_objs = []
        for i, al in enumerate(SEED_DATA["albums"]):
            album = models.Album(
                title=al["title"],
                artist_id=artist_objs[al["artist_idx"]].id,
                cover_url=COVERS[i],
                release_year=al["year"],
                genre=al["genre"],
            )
            db.add(album)
            album_objs.append(album)
        db.flush()

        # Create songs
        for s in SEED_DATA["songs"]:
            artist = artist_objs[s["artist_idx"]]
            song = models.Song(
                title=s["title"],
                artist_id=artist.id,
                album_id=album_objs[s["album_idx"]].id,
                duration_sec=s["duration"],
                audio_url=AUDIO[s["audio_idx"]],
                genre=SEED_DATA["albums"][s["album_idx"]]["genre"],
                play_count=0,
            )
            db.add(song)

        # Create demo user
        demo = models.User(
            username="demo",
            email="demo@spotify.com",
            hashed_password=hash_password("demo1234"),
        )
        db.add(demo)

        db.commit()
        print(f"[OK] Seeded {len(artist_objs)} artists, {len(album_objs)} albums, {len(SEED_DATA['songs'])} songs.")
        print("     Demo user: demo@spotify.com / demo1234")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
