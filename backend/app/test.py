import json
import os

# ==========================================
# 1. NEW METADATA (Marina to Zulan)
# ==========================================
artist_updates = {
    "Marina": {
        "genres": ["Synth-Pop", "Indie Pop", "New Wave"],
        "energy": 0.75,
        "tempo": 129.20,
        "description": "Dreamy synth-pop sound infused with whimsical melodies and introspective lyrics, showcasing Marina's ethereal vocals."
    },
    "Marti Perramon": {
        "genres": ["Indie Pop", "Electronic", "Lo-Fi"],
        "energy": 0.65,
        "tempo": 131.35,
        "description": "Eclectic fusion of indie pop and electronic elements, characterized by airy vocals and introspective lyrics."
    },
    "Mathilda Homer": {
        "genres": ["Indie Folk", "Jazz-Pop", "Neo-Soul"],
        "energy": 0.50,
        "tempo": 132.32,
        "description": "Delivers an enchanting fusion of ethereal pop and introspective indie-folk, characterized by delicate vocals."
    },
    "Meduza": {
        "genres": ["Deep House", "Melodic House", "EDM"],
        "energy": 0.85,
        "tempo": 124.00,
        "description": "Dynamic electronic trio celebrated for their infectious deep house beats and soaring melodies."
    },
    "Meek": {
        "genres": ["Hip-Hop", "Rap"],
        "energy": 0.80,
        "tempo": 172.27,
        "description": "Authentic and gritty hip-hop artist with a powerful, raspy vocal delivery that channels street narratives."
    },
    "Mette": {
        "genres": ["Synth-Pop", "Dance", "Funk-Pop"],
        "energy": 0.80,
        "tempo": 134.00,
        "description": "Dreamy synth-pop infused with ethereal vocals and introspective lyrics that evoke a sense of nostalgia."
    },
    "Mimi Webb": {
        "genres": ["Pop", "Power Pop", "Singer-Songwriter"],
        "energy": 0.75,
        "tempo": 131.03,
        "description": "Powerful pop anthems infused with emotional vulnerability and a dynamic vocal delivery."
    },
    "Mk": {
        "genres": ["House", "Deep House", "Dance"],
        "energy": 0.88,
        "tempo": 125.10,
        "description": "Electro-infused pop artist with smooth, emotive vocals and an infectious blend of upbeat melodies."
    },
    "Muireann Bradley": {
        "genres": ["Indie Folk", "Blues", "Acoustic"],
        "energy": 0.45,
        "tempo": 118.90,
        "description": "Evocative indie-folk artist with a hauntingly sweet vocal style and deeply introspective lyrics."
    },
    "Myles Smith": {
        "genres": ["Indie Pop", "Soul", "Folk-Pop"],
        "energy": 0.65,
        "tempo": 117.62,
        "description": "Soulful fusion of indie pop and electronic elements, characterized by ethereal vocals and introspective lyrics."
    },
    "Nathan Dawe": {
        "genres": ["Dance-Pop", "House", "UK Garage"],
        "energy": 0.90,
        "tempo": 125.10,
        "description": "Upbeat and infectious blend of dance-pop and electronic sounds, characterized by catchy hooks and vibrant energy."
    },
    "Nectar Wood": {
        "genres": ["Ambient", "Indie", "Experimental"],
        "energy": 0.50,
        "tempo": 133.62,
        "description": "Ethereal fusion of ambient soundscapes and introspective lyrics, characterized by hauntingly delicate vocals."
    },
    "Nell Mescal": {
        "genres": ["Indie Pop", "Alt-Pop", "Folk"],
        "energy": 0.60,
        "tempo": 120.13,
        "description": "Dreamy alt-pop artist with ethereal vocals and introspective lyrics that evoke a haunting yet uplifting emotional landscape."
    },
    "Newdad": {
        "genres": ["Indie Rock", "Shoegaze", "Dream Pop"],
        "energy": 0.65,
        "tempo": 121.37,
        "description": "Dreamy indie pop infused with ethereal vocals and introspective lyrics that evoke a sense of nostalgia."
    },
    "Nia Smith": {
        "genres": ["R&B", "Soul", "Contemporary R&B"],
        "energy": 0.60,
        "tempo": 126.32,
        "description": "Contemporary R&B artist delivering a sultry fusion of smooth melodies and powerful vocals."
    },
    "Niall Horan": {
        "genres": ["Pop", "Folk-Pop", "Soft Rock"],
        "energy": 0.65,
        "tempo": 102.05,
        "description": "Melodic pop-folk artist with a soothing, emotive vocal style that captures both warmth and introspection."
    },
    "No Rome": {
        "genres": ["Dream Pop", "Indie Rock", "R&B"],
        "energy": 0.65,
        "tempo": 101.60,
        "description": "Eclectic fusion of dream pop and indie rock, characterized by shimmering soundscapes and ethereal vocals."
    },
    "Notion": {
        "genres": ["Alt-Pop", "Electronic", "Indie"],
        "energy": 0.60,
        "tempo": 136.00,
        "description": "Introspective blend of alternative pop and electronic beats, characterized by ethereal vocals and a melancholic resonance."
    },
    "Oliver Heldens": {
        "genres": ["Future House", "House", "EDM"],
        "energy": 0.90,
        "tempo": 123.05,
        "description": "Dynamic house producer renowned for infectious grooves, vibrant melodies, and uplifting vocal hooks."
    },
    "Olivia Dean": {
        "genres": ["Soul", "Pop", "R&B"],
        "energy": 0.60,
        "tempo": 128.02,
        "description": "Soulful pop infused with lush melodies and introspective lyrics, showcasing a rich vocal tone."
    },
    "Olly Alexander": {
        "genres": ["Pop", "Synth-Pop", "Queer Pop"],
        "energy": 0.75,
        "tempo": 114.14,
        "description": "Electro-pop sensation with soaring vocals and introspective lyrics that blend vulnerability and exuberance."
    },
    "Olly Murs": {
        "genres": ["Pop", "Dance-Pop"],
        "energy": 0.80,
        "tempo": 101.12,
        "description": "Catchy pop-infused sound with an upbeat, feel-good vibe, characterized by playful melodies."
    },
    "Only The Poets": {
        "genres": ["Pop-Rock", "Indie"],
        "energy": 0.75,
        "tempo": 132.34,
        "description": "Dynamic pop-rock sound infused with anthemic choruses and heartfelt vocals that evoke a sense of youthful exuberance."
    },
    "Pa Salieu": {
        "genres": ["UK Rap", "Afrobeats", "Grime"],
        "energy": 0.80,
        "tempo": 104.03,
        "description": "Dynamic fusion of UK rap and Afrobeats, characterized by gritty lyricism and infectious rhythms."
    },
    "Paige Cavell": {
        "genres": ["Indie Pop", "Alt-Rock"],
        "energy": 0.70,
        "tempo": 125.10,
        "description": "Melodic fusion of indie pop and alternative rock, characterized by ethereal vocals and introspective lyrics."
    },
    "Pale Waves": {
        "genres": ["Indie Pop", "Goth-Pop", "Synth-Pop"],
        "energy": 0.75,
        "tempo": 110.93,
        "description": "Dreamy pop-infused soundscapes with shimmering instrumentals and emotionally charged vocals."
    },
    "Paloma Faith": {
        "genres": ["Pop", "Soul", "Jazz-Pop"],
        "energy": 0.70,
        "tempo": 105.73,
        "description": "Eclectic pop infused with vintage soul and theatrical flair, characterized by powerful vocals."
    },
    "Paul Woolford": {
        "genres": ["House", "Piano House", "Techno"],
        "energy": 0.90,
        "tempo": 123.05,
        "description": "Dynamic house and techno producer celebrated for his pulsating beats and intricate melodies."
    },
    "Perrie": {
        "genres": ["Pop", "Dream Pop"],
        "energy": 0.70,
        "tempo": 127.23,
        "description": "Delivers an ethereal fusion of dream-pop and indie-electronica, characterized by hauntingly smooth vocals."
    },
    "Pretty Sick": {
        "genres": ["Grunge", "Alt-Rock", "Indie"],
        "energy": 0.80,
        "tempo": 115.98,
        "description": "Grunge-infused alt-pop with haunting vocals and introspective lyrics that evoke both nostalgia and raw emotion."
    },
    "Prinz": {
        "genres": ["Electronic", "Indie Pop", "Rap"],
        "energy": 0.75,
        "tempo": 143.55,
        "description": "Eclectic fusion of electronic and indie pop, characterized by dreamy synths and emotive vocals."
    },
    "Priya Ragu": {
        "genres": ["R&B", "Pop", "Fusion"],
        "energy": 0.80,
        "tempo": 142.75,
        "description": "Eclectic fusion of Sri Lankan influences, R&B, and pop, highlighted by soulful vocals."
    },
    "Rachel Chinouriri": {
        "genres": ["Indie Pop", "Soul", "Alt-Pop"],
        "energy": 0.60,
        "tempo": 135.15,
        "description": "Intimate and emotive indie-pop sound characterized by soulful vocals and poignant lyrical storytelling."
    },
    "Rag’N’Bone Man": {
        "genres": ["Soul", "Blues", "Rock"],
        "energy": 0.75,
        "tempo": 123.05,
        "description": "Soulful and gritty, combining powerful, blues-infused vocals with poignant lyrics."
    },
    "Regard": {
        "genres": ["Deep House", "Pop", "Dance"],
        "energy": 0.85,
        "tempo": 119.32,
        "description": "Captivating blend of deep house and melodic pop, characterized by lush synths and infectious rhythms."
    },
    "Rhys Lewis": {
        "genres": ["Pop", "Soul", "Singer-Songwriter"],
        "energy": 0.60,
        "tempo": 139.13,
        "description": "Soulful fusion of pop and indie with emotive vocals and introspective lyrics that resonate deeply."
    },
    "Rina Sawayama": {
        "genres": ["Pop", "Rock", "Nu-Metal", "R&B"],
        "energy": 0.85,
        "tempo": 112.76,
        "description": "Eclectic fusion of pop, rock, and R&B with bold vocals and an empowering emotional resonance."
    },
    "Ronan Keating": {
        "genres": ["Pop", "Ballad"],
        "energy": 0.55,
        "tempo": 136.38,
        "description": "Smooth, melodic pop with heartfelt lyrics and a warm, emotive vocal delivery."
    },
    "Roro": {
        "genres": ["Synth-Pop", "Indie", "Electronic"],
        "energy": 0.70,
        "tempo": 136.38,
        "description": "Eclectic fusion of dreamy synth-pop and introspective indie rock, characterized by ethereal vocals."
    },
    "Royal Blood": {
        "genres": ["Rock", "Garage Rock", "Hard Rock"],
        "energy": 0.90,
        "tempo": 116.40,
        "description": "Explosive rock duo combining heavy riffs, pulsating bass lines, and gritty vocals."
    },
    "Rudimental": {
        "genres": ["Drum & Bass", "Pop", "Soul"],
        "energy": 0.92,
        "tempo": 110.93,
        "description": "Dynamic fusion of drum and bass, soul, and pop, characterized by uplifting melodies."
    },
    "Ruti": {
        "genres": ["Pop", "Soul", "Jazz"],
        "energy": 0.60,
        "tempo": 128.12,
        "description": "Hauntingly ethereal pop infused with soulful melodies and introspective lyrics."
    },
    "Saga Faye": {
        "genres": ["Pop", "R&B", "Indie"],
        "energy": 0.65,
        "tempo": 112.79,
        "description": "Delivers a captivating fusion of ethereal pop and introspective R&B, highlighted by soaring vocals."
    },
    "Sam Fender": {
        "genres": ["Indie Rock", "Rock", "Alternative"],
        "energy": 0.80,
        "tempo": 132.14,
        "description": "Anthemic indie rock infused with gritty realism and powerful, emotive vocals."
    },
    "Sam Ryder": {
        "genres": ["Pop-Rock", "Eurovision"],
        "energy": 0.85,
        "tempo": 118.57,
        "description": "Uplifting pop-rock sound characterized by soaring vocals and anthemic choruses."
    },
    "Sam Smith": {
        "genres": ["Pop", "Soul", "R&B"],
        "energy": 0.60,
        "tempo": 135.86,
        "description": "Soulful pop balladeer with a rich, emotive vocal style that conveys vulnerability."
    },
    "Sam Tompkins": {
        "genres": ["Pop", "Soul", "Acoustic"],
        "energy": 0.65,
        "tempo": 123.64,
        "description": "Soulful pop artist with an emotive vocal delivery that weaves together introspective lyrics."
    },
    "Sammy Virji": {
        "genres": ["UK Garage", "Bassline", "Electronic"],
        "energy": 0.90,
        "tempo": 115.83,
        "description": "Energetic blend of electronic and pop influences with infectious hooks and vibrant vocals."
    },
    "Say Now": {
        "genres": ["Indie Pop", "Electronic"],
        "energy": 0.70,
        "tempo": 120.37,
        "description": "Eclectic fusion of indie pop and electronic soundscapes, characterized by ethereal vocals."
    },
    "Saya Gray": {
        "genres": ["Ambient Pop", "Experimental", "Indie"],
        "energy": 0.50,
        "tempo": 123.95,
        "description": "Delivers a hauntingly ethereal sound that fuses ambient pop and electronic elements."
    },
    "Schak": {
        "genres": ["House", "Electronic", "Jump Up"],
        "energy": 0.90,
        "tempo": 136.25,
        "description": "Dynamic fusion of house and electronic sounds, characterized by infectious grooves."
    },
    "Sebastian Schub": {
        "genres": ["Indie Pop", "Electronic"],
        "energy": 0.60,
        "tempo": 119.32,
        "description": "Melodic fusion of indie pop and electronic elements, characterized by ethereal vocals."
    },
    "Sekou": {
        "genres": ["R&B", "Pop", "Soul"],
        "energy": 0.65,
        "tempo": 112.88,
        "description": "Delivers a captivating fusion of soulful R&B and contemporary pop with smooth vocals."
    },
    "Sg Lewis": {
        "genres": ["Electronic", "Disco", "House"],
        "energy": 0.80,
        "tempo": 110.37,
        "description": "Fusing lush electronic soundscapes with smooth, soulful vocals."
    },
    "Sigala": {
        "genres": ["Dance-Pop", "House", "Tropical House"],
        "energy": 0.90,
        "tempo": 123.05,
        "description": "Uplifting dance-pop maestro celebrated for infectious melodies and vibrant beats."
    },
    "Sigrid": {
        "genres": ["Pop", "Synth-Pop"],
        "energy": 0.75,
        "tempo": 108.17,
        "description": "Dynamic pop sound infused with anthemic melodies and powerful vocals."
    },
    "Silva Bumpa": {
        "genres": ["Electronic", "R&B", "Garage"],
        "energy": 0.75,
        "tempo": 108.00,
        "description": "Eclectic fusion of electronic beats and smooth R&B vocals."
    },
    "Silver Gore": {
        "genres": ["Darkwave", "Synth-Pop", "Goth"],
        "energy": 0.70,
        "tempo": 114.19,
        "description": "Eclectic fusion of darkwave and synth-pop, characterized by haunting vocals."
    },
    "Skye Newman": {
        "genres": ["Indie Pop", "Dream Pop"],
        "energy": 0.60,
        "tempo": 140.79,
        "description": "Dreamy indie-pop sound characterized by ethereal vocals and introspective lyrics."
    },
    "South Arcade": {
        "genres": ["Synth-Pop", "Nostalgic", "Indie"],
        "energy": 0.75,
        "tempo": 119.32,
        "description": "Eclectic fusion of dreamy synths and nostalgic 80s pop."
    },
    "Sports Team": {
        "genres": ["Indie Rock", "Alt-Rock"],
        "energy": 0.80,
        "tempo": 125.50,
        "description": "Eclectic indie rock infused with witty lyrics and an upbeat, anthemic sound."
    },
    "Stormzy": {
        "genres": ["Grime", "Hip-Hop", "Gospel"],
        "energy": 0.85,
        "tempo": 126.73,
        "description": "Dynamic fusion of grime and hip-hop, characterized by powerful, commanding vocals."
    },
    "Sub Focus": {
        "genres": ["Drum & Bass", "Electronic", "Dance"],
        "energy": 0.95,
        "tempo": 141.91,
        "description": "Dynamic drum and bass producer renowned for pulsating beats and atmospheric soundscapes."
    },
    "Switch Disco": {
        "genres": ["Dance-Pop", "House", "Mashup"],
        "energy": 0.90,
        "tempo": 125.10,
        "description": "Energetic fusion of dance-pop and electronic beats, highlighted by infectious melodies."
    },
    "Take That": {
        "genres": ["Pop", "Pop-Rock"],
        "energy": 0.70,
        "tempo": 161.50,
        "description": "Melodic pop harmonies infused with nostalgic 90s flair."
    },
    "Teddy Swims": {
        "genres": ["R&B", "Soul", "Pop", "Rock"],
        "energy": 0.85,
        "tempo": 134.75,
        "description": "Soulful fusion of R&B and pop with powerful, emotive vocals."
    },
    "The 1975": {
        "genres": ["Indie Pop", "Alt-Rock", "Pop-Rock"],
        "energy": 0.70,
        "tempo": 106.04,
        "description": "Eclectic fusion of synth-pop and rock with introspective lyrics."
    },
    "The Blessed Madonna": {
        "genres": ["House", "Disco"],
        "energy": 0.85,
        "tempo": 125.10,
        "description": "Eclectic house and disco-infused soundscapes, characterized by uplifting grooves."
    },
    "The Japanese House": {
        "genres": ["Dream Pop", "Indie", "Synth-Pop"],
        "energy": 0.60,
        "tempo": 106.61,
        "description": "Ethereal blend of dreamy synth-pop and introspective lyrics."
    },
    "Tion Wayne": {
        "genres": ["UK Drill", "Afro-Swing"],
        "energy": 0.85,
        "tempo": 120.23,
        "description": "Dynamic fusion of UK rap and Afrobeat, characterized by catchy hooks."
    },
    "Tiësto": {
        "genres": ["EDM", "Big Room", "Trance", "House"],
        "energy": 0.95,
        "tempo": 119.32,
        "description": "Dynamic electronic dance music pioneer renowned for pulsating beats."
    },
    "Tom Grennan": {
        "genres": ["Indie Pop", "Soul", "Rock"],
        "energy": 0.75,
        "tempo": 129.62,
        "description": "Uplifting and soulful pop-rock sound characterized by powerful, gritty vocals."
    },
    "Tom Walker": {
        "genres": ["Folk-Pop", "Indie Folk", "Rock"],
        "energy": 0.60,
        "tempo": 111.98,
        "description": "Soulful pop infused with folk elements, characterized by emotive storytelling."
    },
    "Unknown T": {
        "genres": ["UK Drill", "Grime"],
        "energy": 0.85,
        "tempo": 129.82,
        "description": "Grime innovator with a unique flow that fuses gritty realism and melodic hooks."
    },
    "Venbee": {
        "genres": ["Drum & Bass", "Pop"],
        "energy": 0.90,
        "tempo": 119.99,
        "description": "Eclectic fusion of vibrant pop and electronic elements."
    },
    "Victor Ray": {
        "genres": ["Indie Pop", "Soul"],
        "energy": 0.65,
        "tempo": 135.26,
        "description": "Smoothly layered indie pop with soulful vocals and introspective lyrics."
    },
    "Westislonely": {
        "genres": ["Lo-Fi", "Indie Pop"],
        "energy": 0.50,
        "tempo": 126.86,
        "description": "Melancholic yet uplifting fusion of lo-fi indie and dreamy pop."
    },
    "Westside Cowboy": {
        "genres": ["Country", "Rock"],
        "energy": 0.70,
        "tempo": 144.42,
        "description": "Eclectic fusion of country and rock with gritty vocals."
    },
    "Wolf Alice": {
        "genres": ["Alt-Rock", "Grunge", "Indie Rock"],
        "energy": 0.75,
        "tempo": 119.63,
        "description": "Eclectic alt-rock sound characterized by haunting vocals."
    },
    "Yungblud": {
        "genres": ["Alt-Rock", "Pop-Punk", "Emo"],
        "energy": 0.90,
        "tempo": 155.17,
        "description": "Eclectic fusion of punk, pop, and alternative rock."
    },
    "Zara Larsson": {
        "genres": ["Pop", "Dance-Pop"],
        "energy": 0.85,
        "tempo": 131.65,
        "description": "Electrifying pop sensation with soaring vocals and empowering anthems."
    },
    "Zoe Wees": {
        "genres": ["Pop", "Soul"],
        "energy": 0.70,
        "tempo": 127.17,
        "description": "Empowering pop sound infused with soulful melodies and emotive, raspy vocals."
    },
    "Zulan": {
        "genres": ["Synth-Pop", "Indie"],
        "energy": 0.65,
        "tempo": 133.73,
        "description": "Eclectic fusion of dreamy synth-pop and introspective indie."
    }
}

# 2. PATH TO YOUR EXISTING DATABASE
db_path = "artist_database.json"

try:
    with open(db_path, "r", encoding="utf-8") as f:
        existing_data = json.load(f)
    print(f"✅ Loaded {len(existing_data)} artists from existing database.")
except FileNotFoundError:
    print("❌ Error: artist_database.json not found.")
    existing_data = {}

# 3. MERGE LOGIC
updated_count = 0

for artist_name, new_info in artist_updates.items():
    if artist_name in existing_data:
        # Use update() to merge new fields into existing fields
        # This overwrites genre/energy/tempo/desc but KEEPS chroma/f0
        existing_data[artist_name].update(new_info)
        updated_count += 1
    else:
        print(f"⚠️ Warning: Artist '{artist_name}' not found in database. Skipping.")

# 4. SAVE BACK TO FILE
with open(db_path, "w", encoding="utf-8") as f:
    json.dump(existing_data, f, indent=4)

print(f"\n🎉 Success! Updated metadata for {updated_count} artists.")