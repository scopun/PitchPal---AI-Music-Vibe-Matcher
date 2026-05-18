"""One-off inspection: query the endpoint and print confidence_level + match_summary for every test."""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1/match-lyrics-only"

tests = [
    ("TEST 1 - Fray (ethereal ballad)", "ethereal atmospheric ballad, haunting female vocals, london grammar birdy style, emotional and vulnerable, sparse production"),
    ("TEST 2 - K-Pop", "k-pop song, korean pop, boyband style, energetic, bright production, idol group"),
    ("TEST 3 - Future Rave", "future rave electronic dance, house techno big room, futuristic sound, david guetta morten style"),
    ("TEST 4 - Country Pop", "country pop female vocals, uplifting road trip feel, kylie golden album style, ella henderson country"),
    ("TEST 5 - Singer Songwriter", "intimate singer songwriter, acoustic, gracie abrams taylor swift style, emotional and vulnerable, raw acoustic"),
    ("TEST 6 - Jazzy Electronic", "jazzy electronic dance, uk dance, jazzy giving me style, energetic female vocals, dancefloor"),
    ("TEST 7 - Victor Ray Soul", "soulful R&B, modern pop, singer songwriter acoustic elements, raw emotive vocal runs, male vocals"),
    ("TEST 8 - Anne-Marie Dance Pop", "upbeat dance pop, powerful female vocals, anne marie jess glynne dua lipa style, anthemic"),
    ("TEST 9 - Take That", "classic anthemic pop, boyband feel, emotional and uplifting, shine patience style, timeless british pop"),
    ("TEST 10 - Duffy Soul", "warm vintage female soul, joss stone amy winehouse territory, back to black feel, soulful retro"),
    ("TEST 11 - Spanish", "cancion en espanol, pop latino oscuro, rosalia style, art pop español, flamenco influenced"),
    ("TEST 12 - Dark Techno", "dark underground techno, anyma afterlife style, cinematic electronic, cold and intense, atmospheric"),
    ("TEST 13 - Forgive Me Ballad", "forgive me i love you, sparse emotional ballad, singer songwriter, vulnerable female vocal, intimate piano"),
    ("TEST 14 - Myles Smith", "intimate male singer songwriter, myles smith territory, emotional piano pop, personal storytelling"),
]

dist = {"Strong Match": 0, "Good Match": 0, "Worth Considering": 0}
sort_ok = True
summary_present = True

print("=" * 80)
print("CONFIDENCE INSPECTION")
print("=" * 80)

for name, lyrics in tests:
    resp = requests.post(BASE_URL, data={"lyrics": lyrics, "debug": "false"}, timeout=60)
    data = resp.json()
    matches = data.get("matches", [])
    summary = data.get("match_summary")

    if summary is None:
        summary_present = False

    scores = [m.get("final_score", 0) for m in matches]
    is_sorted = scores == sorted(scores, reverse=True)
    if not is_sorted:
        sort_ok = False

    print(f"\n{name}")
    print(f"  match_summary: {summary}")
    print(f"  sorted descending: {is_sorted}")
    for m in matches:
        cl = m.get("confidence_level", "MISSING")
        dist[cl] = dist.get(cl, 0) + 1
        print(f"    {m.get('final_score'):.2f}  [{cl:18}]  {m.get('artist')}")

print("\n" + "=" * 80)
print("OVERALL")
print("=" * 80)
print(f"Confidence distribution across all tests: {dist}")
print(f"Sorting correct in every test: {sort_ok}")
print(f"match_summary present in every response: {summary_present}")
