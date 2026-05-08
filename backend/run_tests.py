"""
PitchPal Regression Tests - 14 tests ek saath
Run: python3 run_tests.py
Server must be running: uvicorn app.main:app --reload
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1/match-lyrics-only"

tests = [
    {
        "name": "TEST 1 — Fray (ethereal ballad)",
        "lyrics": "ethereal atmospheric ballad, haunting female vocals, london grammar birdy style, emotional and vulnerable, sparse production",
        "expect": ["London Grammar", "Celeste", "Holly Humberstone", "Nell Mescal"],
        "not_expect": ["Sigala", "Becky Hill", "Zara Larsson", "Sia"]
    },
    {
        "name": "TEST 2 — K-Pop Song",
        "lyrics": "k-pop song, korean pop, boyband style, energetic, bright production, idol group",
        "expect": [],
        "not_expect": ["Ashnikko", "Holly Humberstone", "Baby Queen", "Sigala"]
    },
    {
        "name": "TEST 3 — Future Rave Electronic",
        "lyrics": "future rave electronic dance, house techno big room, futuristic sound, david guetta morten style",
        "expect": ["David Guetta", "Tiësto", "Calvin Harris"],
        "not_expect": ["Holly Humberstone", "Nell Mescal", "Sigala", "Becky Hill"]
    },
    {
        "name": "TEST 4 — Country Pop",
        "lyrics": "country pop female vocals, uplifting road trip feel, kylie golden album style, ella henderson country",
        "expect": ["Kylie Minogue", "Nell Mescal", "Joel Corry"],
        "not_expect": ["Becky Hill", "Gorgon City", "Clean Bandit"]
    },
    {
        "name": "TEST 5 — Singer Songwriter (Forget Me Knot)",
        "lyrics": "intimate singer songwriter, acoustic, gracie abrams taylor swift style, emotional and vulnerable, raw acoustic",
        "expect": ["Nell Mescal", "Lewis Capaldi", "Cian Ducrot", "Myles Smith"],
        "not_expect": ["Becky Hill", "Clean Bandit", "Gorgon City"]
    },
    {
        "name": "TEST 6 — Jazzy Electronic Dance",
        "lyrics": "jazzy electronic dance, uk dance, jazzy giving me style, energetic female vocals, dancefloor",
        "expect": ["Jazzy", "Becky Hill", "Sigala"],
        "not_expect": ["Holly Humberstone", "Maisie Peters", "Nell Mescal"]
    },
    {
        "name": "TEST 7 — Victor Ray (Soulful R&B)",
        "lyrics": "soulful R&B, modern pop, singer songwriter acoustic elements, raw emotive vocal runs, male vocals",
        "expect": ["Victor Ray", "Elmiene", "Sam Fischer"],
        "not_expect": ["Holly Humberstone", "Pale Waves", "Sigala"]
    },
    {
        "name": "TEST 8 — Anne Marie Dance Pop",
        "lyrics": "upbeat dance pop, powerful female vocals, anne marie jess glynne dua lipa style, anthemic",
        "expect": ["Anne-Marie", "Jess Glynne", "Becky Hill"],
        "not_expect": ["Holly Humberstone", "Nell Mescal", "Pale Waves"]
    },
    {
        "name": "TEST 9 — Take That Anthemic Pop",
        "lyrics": "classic anthemic pop, boyband feel, emotional and uplifting, shine patience style, timeless british pop",
        "expect": ["Take That", "Only The Poets", "James Arthur"],
        "not_expect": ["Avicii", "Tiësto", "Sigala"]
    },
    {
        "name": "TEST 10 — Duffy/Joss Stone Soul",
        "lyrics": "warm vintage female soul, joss stone amy winehouse territory, back to black feel, soulful retro",
        "expect": ["Paloma Faith", "Celeste", "Brooke Combe"],
        "not_expect": ["Sigala", "Clean Bandit", "Becky Hill"]
    },
    {
        "name": "TEST 11 — Spanish Song",
        "lyrics": "cancion en espanol, pop latino oscuro, rosalia style, art pop español, flamenco influenced",
        "expect": ["Rosalía", "Nathy Peluso", "C. Tangana"],
        "not_expect": ["Lewis Capaldi", "Becky Hill", "Take That"]
    },
    {
        "name": "TEST 12 — Dark Techno (Anyma)",
        "lyrics": "dark underground techno, anyma afterlife style, cinematic electronic, cold and intense, atmospheric",
        "expect": ["Anyma", "Tale Of Us", "CamelPhat"],
        "not_expect": ["Meduza", "Sigala", "Becky Hill"]
    },
    {
        "name": "TEST 13 — Forgive Me Ballad",
        "lyrics": "forgive me i love you, sparse emotional ballad, singer songwriter, vulnerable female vocal, intimate piano",
        "expect": ["Lewis Capaldi", "Sam Fischer", "Cian Ducrot"],
        "not_expect": ["Becky Hill", "Meduza", "Sigala"]
    },
    {
        "name": "TEST 14 — Myles Smith Demo",
        "lyrics": "intimate male singer songwriter, myles smith territory, emotional piano pop, personal storytelling",
        "expect": ["Myles Smith", "Lewis Capaldi", "Cian Ducrot"],
        "not_expect": ["Take That", "Sigala", "Becky Hill"]
    }
]

passed = 0
failed = 0
results_summary = []

print("=" * 60)
print("PITCHPAL REGRESSION TESTS")
print("=" * 60)

for i, test in enumerate(tests, 1):
    try:
        resp = requests.post(
            BASE_URL,
            data={"lyrics": test["lyrics"], "debug": "false"},
            timeout=60
        )
        data = resp.json()
        matches = data.get("matches", [])
        artists = [m["artist"] for m in matches]
        genre = data.get("detected_genre", "")

        # Check expected artists
        found_expected = [a for a in test["expect"] if any(a.lower() in ar.lower() for ar in artists)]
        found_wrong = [a for a in test["not_expect"] if any(a.lower() in ar.lower() for ar in artists)]

        status = "✅ PASS" if not found_wrong else "❌ FAIL"
        if test["expect"] and not found_expected:
            status = "⚠️  PARTIAL"

        if "FAIL" in status:
            failed += 1
        else:
            passed += 1

        print(f"\n{status} — {test['name']}")
        print(f"  Genre: {genre[:60]}")
        print(f"  Artists: {', '.join(artists[:5])}")
        if found_wrong:
            print(f"  ❌ WRONG artists found: {', '.join(found_wrong)}")
        if test["expect"] and not found_expected:
            print(f"  ⚠️  Expected not found: {', '.join(test['expect'])}")

        results_summary.append({
            "test": test["name"],
            "status": status,
            "artists": artists,
            "wrong": found_wrong
        })

    except Exception as e:
        print(f"\n💥 ERROR — {test['name']}: {e}")
        failed += 1

print("\n" + "=" * 60)
print(f"RESULTS: {passed} PASSED | {failed} FAILED | {len(tests)} TOTAL")
print("=" * 60)

# Save results
with open("test_results.json", "w") as f:
    json.dump(results_summary, f, indent=2)
print("\nDetailed results saved to: test_results.json")
