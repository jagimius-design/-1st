# Kite alert: Copenhagen

Sends a notification to your phone when the forecast is good for kitesurfing at
spots around Copenhagen.

Twice a day (around 07:00 and 17:00) a GitHub Action gets the hourly forecast for
the next 3 days from [Open-Meteo](https://open-meteo.com), which is free and needs
no API key. It uses the best weather model available for each spot. If a spot has a
run of good hours, you get a notification like this:

```
Kite weather! 2 windows near Copenhagen

Amager Strandpark
  Sat 21 Nov 10:00–15:00 · 19 kn (gusts 25) from ESE · 7°C

Sydvestpynten (Amager)
  Sun 22 Nov 12:00–15:00 · 17 kn (gusts 23) from SW · 8°C
```

Tapping the notification opens Windy over Copenhagen. If nothing is good, you get
no notification.

## What counts as "good"

An hour is good when all of these hold (you can change them in `config.json`):

| Rule | Default |
|---|---|
| Wind speed | 15–32 kn |
| Gusts | at most 38 kn, and no more than 12 kn above the mean wind (no very gusty days) |
| Direction | inside the spot's `wind_sectors`, so onshore or side-shore and never offshore |
| Daylight | yes |
| Thunderstorms | none |
| Rain | at most 3 mm per hour |
| Air temperature | not checked (`min_temp_c: null`); set e.g. `5` if you don't want winter alerts |
| Window length | at least 2 hours in a row |

## Spots

| Spot | Works in (wind from) |
|---|---|
| Amager Strandpark | N → E → S (10°–190°) |
| Sydvestpynten | S → SW → WNW (170°–300°) |
| Dragør Sydstrand | E → S → W (80°–280°) |
| Køge Bugt Strandpark | ENE → S → SW (70°–230°) |
| Bellevue | NNE → E → S (20°–180°) |

These sectors are a starting point. Adjust them to what you know works, and check
local rules: some beaches have kite zones or summer bans. To add a spot, copy an
entry and set its `lat`, `lon` and `wind_sectors`. Sectors can wrap past north,
e.g. `[[300, 30]]`. A spot can also override the general rules, e.g.
`"rules": {"min_wind_kn": 12}` for a spot where you use a bigger kite.

## Setup (about 5 minutes)

### 1. Get push notifications with ntfy (free)

1. Install the **ntfy** app ([Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy) / [iPhone](https://apps.apple.com/app/ntfy/id1625396347)).
2. In the app, tap **+** and subscribe to a topic with a long, random name that only
   you know, e.g. `kite-cph-7f3k9x2q`. Anyone who knows the name can read or
   send to it, so don't use a guessable one.

### 2. Add the topic as a GitHub secret

In the repo on GitHub: **Settings → Secrets and variables → Actions → New repository secret**

- Name: `NTFY_TOPIC`, value: your topic name

Optional: email as well (Gmail example). Create an
[app password](https://myaccount.google.com/apppasswords) and add:

- `SMTP_USER`: your Gmail address
- `SMTP_PASSWORD`: the app password
- `EMAIL_TO`: where to send the alerts

### 3. Get the workflow onto the default branch

GitHub only runs scheduled workflows from the default branch (`main`), so merge
this branch first.

### 4. Test it

Go to **Actions → Kite alert → Run workflow**, tick **Send a notification even if
conditions are not good**, and run it. Your phone should buzz within a minute.

## Run it locally

Needs Python 3.9+ and nothing else.

```bash
python3 kite-alert/kite_alert.py --dry-run          # print the forecast check
NTFY_TOPIC=your-topic python3 kite-alert/kite_alert.py --test
python3 -m unittest discover -s kite-alert          # tests (offline)
```

## Notes

- If a public repo has no activity for 60 days, GitHub turns off its scheduled
  workflows. Re-enable it from the Actions tab if that happens.
- The wind forecast is for 10 m height. Always check the conditions on the beach
  before you go out.
