# Mine danske ord

A notebook of the Danish words taken from dictionary screenshots (ordbogen.com).

- **Live page:** https://claude.ai/artifact/2sbRWPwJLLnfJSEijsXyQN (private)
- `index.html`: the page source. It reads the words from the page's own database, collection `words`.
- `words.json`: a backup copy of every word in the database, one object per word.

## Word format

```json
{ "id": "koge", "word": "koge", "pos": "vb.", "forms": "-r, kogte, kogt",
  "gloss": "boil, simmer",
  "senses":  [{ "en": "boil", "note": "", "ex_en": "...", "ex_da": "..." }],
  "phrases": [{ "da": "koge over", "senses": [{ "en": "boil over" }] }] }
```

`id` is the word in lowercase ASCII (æ → ae, ø → oe, å → aa). A word that is in the dictionary as two word classes gets a suffix, such as `nytte` (noun) and `nytte-vb` (verb).

Fields added by Claude, not taken from the dictionary:

- `synonyms`: Danish synonyms.
- `extra`: "Godt at vide", extra usage notes.
- `check`: corrections and cautions from Claude's accuracy check of the dictionary entry.
- `note`: what was cut off in the screenshot or filled in by Claude.
- `screens`: which uploaded screenshots the entry came from.

Dictionary screenshots are in `screenshots/`.

## Adding words

- Send Claude new screenshots. Claude reads them and adds the words to the database and to `words.json`.
- Or use **+ Tilføj ord** on the page. It only appears for the owner.

Flashcard progress is saved separately for each person, so nobody else can see it.
