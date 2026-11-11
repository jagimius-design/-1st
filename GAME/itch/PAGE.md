# Loopstone on itch.io

How the page works: anyone can play the **free demo in the browser** on the page. Buying gets
the **full game as a download**: one `Loopstone.html` file that opens in any browser and plays
offline. itch.io cannot charge for browser play itself (browser games there only take donations),
so the paid version has to be the download.

## Files to upload

Build them first: `cd GAME && npm ci && node build.mjs` (needs Node 18+ and `zip`).

| File | Where it comes from | itch.io upload settings |
|---|---|---|
| `loopstone-browser-demo.zip` | `GAME/dist/itch/` | Tick **"This file will be played in the browser"** |
| `loopstone-full.zip` | `GAME/dist/itch/` | Leave that unticked. Display name: `Loopstone – full game (play offline in your browser)`. Tick Windows, macOS and Linux. |
| `cover.png` (630×500) | `GAME/itch/` | Cover image |
| `embed-background.png` (640×360) | `GAME/itch/` | Embed background (in **Edit theme**) |
| Screenshots | `GAME/store/` | Upload, in this order: `03-capture-paths.png`, `12-rival-intro.png`, `05-loop-ride.png`, `17-jaguar-king.png`, `14-achievements.png` |

## Page settings (Dashboard → Create new project)

1. **Title:** Loopstone
2. **Project URL:** `loopstone` (the page becomes `https://YOURNAME.itch.io/loopstone`)
3. **Short description or tagline:** Jade against obsidian. Every capture rides the loops.
4. **Classification:** Games. **Kind of project:** HTML. **Release status:** Released.
5. **Pricing:** Paid, **$4.99**. Leave "allow people to pay more than the minimum" on.
6. **Uploads:** the two zips, as in the table above.
7. **Embed options:**
   - Embed in page, **manually set size 540 × 800**
   - **Mobile friendly** on, orientation **Portrait**
   - **Fullscreen button** on
   - **Automatically start on page load** off (sound and music start after the first tap anyway)
8. **Description:** paste the text in the next section.
9. **Genre:** Strategy.
10. **Tags:** board-game, strategy, abstract, ancient, singleplayer, local-multiplayer, puzzle, turn-based, mobile, offline
11. **AI generation disclosure:** itch.io asks whether the project uses generative AI. The code, art
    and music were made with AI assistance, so answer yes and say so. Buyers and itch.io both
    expect an honest answer here.
12. **Visibility:** save as **Draft** first. Open the page, play the demo, buy your own copy with a
    100% discount code if you want to test the download, then switch to **Public**.

**Edit theme** (on the page itself), to match the game: background `#0d1612`, text `#efe4c8`,
links `#e2b35a`, buttons `#3f9a72`.

**Payments** (Settings → Payouts): choose **"Collected by itch.io, paid out periodically"**. itch.io
then handles VAT and sales tax on each sale as the marketplace. You still declare your earnings on
your own tax return. itch.io will ask you to complete a tax form before the first payout.

## Description (paste into the page)

> **Slide, loop, strike.**
>
> Loopstone brings a centuries-old strategy game to an ancient temple in the jungle. Jade and obsidian
> stones meet on a carved limestone board, and the only way to capture is to ride the great loops
> around its corners.
>
> Moving is simple: one step in any direction. Capturing is where it gets wild. Your stone races
> along the inlaid lines and swings round the loops to strike an enemy from across the board.
> Every line is a threat. Every loop is a chance.
>
> **Play the demo above, free.** The full game is a single download that plays offline in your browser.
>
> **In the full game**
> - **Temple Ascent:** climb the pyramid past 8 rivals, from the Bone Scribe to the Serpent King,
>   each with a face, a voice and a grudge
> - **3 rule sets:** Classic, Jaguar King (capture the crowned king to win) and Skirmish (6 stones each, fast and brutal)
> - **Quick Play** against 5 computer levels, up to a Master that thinks many moves ahead
> - **Pass & Play** with a friend on one device
> - **Learn fast:** a 2-minute interactive tutorial, a Beginner's Path of 7 strategy puzzles, and a
>   coach that comments on your games
> - **12 achievements** that unlock 5 boards and 7 stone sets
> - An original flute, drum and rattle soundtrack that never repeats
> - No ads, no accounts, no internet needed
>
> **The demo includes** the tutorial, all strategy puzzles, the first 3 rivals, Quick Play from
> Beginner to Medium, every rule set and Pass & Play.
>
> *The rules are those of Surakarta, a traditional game from Java, Indonesia. The temple setting is
> inspired by the ancient Maya; all characters are invented.*

## After the page is live

Send the page's address. It goes into `GAME/config.js` (`STORE_URL`), so the demo on the website
(GitHub Pages) links to the store too. The demo embedded on the itch.io page already links back to
its own page without this.
