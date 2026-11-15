#!/usr/bin/env python3
"""Kitesurf forecast alert for Copenhagen.

Checks the hourly wind forecast (Open-Meteo, free, no API key) for kite spots
around Copenhagen and sends a push notification (ntfy) and/or an email when
there is a window of good kiting conditions: enough wind, not too gusty, a
wind direction that works at that spot, daylight and no thunderstorms.

Standard library only. Configure spots and limits in config.json.

Usage:
    python kite_alert.py            # check and notify if conditions are good
    python kite_alert.py --dry-run  # print the message, send nothing
    python kite_alert.py --test     # always send a notification (setup check)
"""

from __future__ import annotations

import argparse
import json
import os
import smtplib
import sys
import urllib.parse
import urllib.request
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path
from zoneinfo import ZoneInfo

API_URL = "https://api.open-meteo.com/v1/forecast"
HOURLY_VARS = [
    "wind_speed_10m",
    "wind_gusts_10m",
    "wind_direction_10m",
    "temperature_2m",
    "precipitation",
    "weather_code",
    "is_day",
]
THUNDER_CODES = {95, 96, 99}
COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
           "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
DEFAULT_CONFIG = Path(__file__).with_name("config.json")


# ---------------------------------------------------------------- forecast

def fetch_forecast(spot: dict, cfg: dict) -> dict:
    """Return Open-Meteo's `hourly` block for one spot (wind in knots)."""
    params = {
        "latitude": spot["lat"],
        "longitude": spot["lon"],
        "hourly": ",".join(HOURLY_VARS),
        "wind_speed_unit": "kn",
        "timezone": cfg.get("timezone", "Europe/Copenhagen"),
        "forecast_days": cfg.get("forecast_days", 3),
        "models": cfg.get("model", "best_match"),
    }
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "kite-alert/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.load(resp)
    return data["hourly"]


# ---------------------------------------------------------------- rules

def in_sector(direction: float, sector: list[float]) -> bool:
    """True if `direction` (degrees the wind comes FROM) is inside [lo, hi].

    Sectors may wrap past north, e.g. [300, 30].
    """
    lo, hi = sector[0] % 360, sector[1] % 360
    d = direction % 360
    return lo <= d <= hi if lo <= hi else d >= lo or d <= hi


def compass(direction: float) -> str:
    return COMPASS[int((direction % 360) / 22.5 + 0.5) % 16]


def hour_ok(h: dict, spot: dict, rules: dict) -> bool:
    """Is a single forecast hour kiteable at this spot?"""
    if rules.get("require_daylight", True) and not h["is_day"]:
        return False
    if h["wind"] is None or h["gust"] is None or h["dir"] is None:
        return False
    if not rules["min_wind_kn"] <= h["wind"] <= rules["max_wind_kn"]:
        return False
    if h["gust"] > rules["max_gust_kn"]:
        return False
    if h["gust"] - h["wind"] > rules["max_gust_spread_kn"]:
        return False
    if h["code"] in THUNDER_CODES:
        return False
    if (h["rain"] or 0) > rules.get("max_rain_mm_per_hour", 99):
        return False
    min_temp = rules.get("min_temp_c")
    if min_temp is not None and h["temp"] is not None and h["temp"] < min_temp:
        return False
    return any(in_sector(h["dir"], s) for s in spot["wind_sectors"])


def rows(hourly: dict) -> list[dict]:
    """Turn Open-Meteo's column arrays into one dict per hour."""
    return [
        {
            "time": datetime.fromisoformat(t),
            "wind": hourly["wind_speed_10m"][i],
            "gust": hourly["wind_gusts_10m"][i],
            "dir": hourly["wind_direction_10m"][i],
            "temp": hourly["temperature_2m"][i],
            "rain": hourly["precipitation"][i],
            "code": hourly["weather_code"][i],
            "is_day": hourly["is_day"][i],
        }
        for i, t in enumerate(hourly["time"])
    ]


def find_windows(hourly: dict, spot: dict, rules: dict, now: datetime) -> list[dict]:
    """Return runs of consecutive good hours that are at least min_hours long."""
    windows, run = [], []
    for h in rows(hourly):
        if h["time"] < now.replace(minute=0, second=0, microsecond=0):
            continue
        if hour_ok(h, spot, rules):
            run.append(h)
            continue
        if run:
            windows.append(run)
        run = []
    if run:
        windows.append(run)
    return [summarize(w) for w in windows if len(w) >= rules["min_hours"]]


def summarize(run: list[dict]) -> dict:
    # Average direction via the dominant compass point (fine for short windows).
    points = [compass(h["dir"]) for h in run]
    return {
        "start": run[0]["time"],
        "end": run[-1]["time"],
        "hours": len(run),
        "avg_wind": round(sum(h["wind"] for h in run) / len(run)),
        "max_gust": round(max(h["gust"] for h in run)),
        "dir": max(set(points), key=points.count),
        "min_temp": round(min(h["temp"] for h in run if h["temp"] is not None))
        if any(h["temp"] is not None for h in run) else None,
    }


def spot_rules(cfg: dict, spot: dict) -> dict:
    return {**cfg["rules"], **spot.get("rules", {})}


# ---------------------------------------------------------------- message

def format_window(w: dict) -> str:
    end_hour = w["end"].hour + 1  # window covers the whole last hour
    temp = f" · {w['min_temp']}°C" if w["min_temp"] is not None else ""
    return (f"{w['start']:%a %d %b} {w['start']:%H}:00–{end_hour:02d}:00 · "
            f"{w['avg_wind']} kn (gusts {w['max_gust']}) from {w['dir']}{temp}")


def build_message(results: list[tuple[dict, list[dict]]]) -> tuple[str, str]:
    good = [(s, ws) for s, ws in results if ws]
    if not good:
        return "No kite weather", "No good kitesurfing windows in the forecast."
    n = sum(len(ws) for _, ws in good)
    title = f"Kite weather! {n} window{'s' if n != 1 else ''} near Copenhagen"
    parts = []
    for spot, ws in good:
        lines = [spot["name"]] + [f"  {format_window(w)}" for w in ws]
        parts.append("\n".join(lines))
    return title, "\n\n".join(parts)


# ---------------------------------------------------------------- notify

def notify_ntfy(title: str, body: str, cfg: dict) -> bool:
    topic = os.environ.get("NTFY_TOPIC")
    if not topic:
        return False
    server = os.environ.get("NTFY_SERVER", "https://ntfy.sh").rstrip("/")
    payload = {
        "topic": topic,
        "title": title,
        "message": body,
        "tags": ["kite"],
        "priority": 4,
        "click": cfg.get("click_url", "https://www.windy.com/55.65/12.60?wind,55.65,12.60,10"),
    }
    req = urllib.request.Request(
        server, data=json.dumps(payload).encode(), method="POST",
        headers={"Content-Type": "application/json"},
    )
    token = os.environ.get("NTFY_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req, timeout=30):
        pass
    return True


def notify_email(title: str, body: str) -> bool:
    to = os.environ.get("EMAIL_TO")
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASSWORD")
    if not (to and user and password):
        return False
    msg = EmailMessage()
    msg["Subject"] = title
    msg["From"] = os.environ.get("EMAIL_FROM", user)
    msg["To"] = to
    msg.set_content(body + "\n\nForecast: Open-Meteo. Always check conditions on the beach.")
    host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    port = int(os.environ.get("SMTP_PORT", "465"))
    with smtplib.SMTP_SSL(host, port, timeout=30) as smtp:
        smtp.login(user, password)
        smtp.send_message(msg)
    return True


# ---------------------------------------------------------------- main

def run(cfg: dict, now: datetime, fetch=fetch_forecast) -> list[tuple[dict, list[dict]]]:
    results = []
    for spot in cfg["spots"]:
        try:
            hourly = fetch(spot, cfg)
        except Exception as e:  # one bad spot should not stop the rest
            print(f"warning: forecast for {spot['name']} failed: {e}", file=sys.stderr)
            continue
        results.append((spot, find_windows(hourly, spot, spot_rules(cfg, spot), now)))
    return results


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    ap.add_argument("--dry-run", action="store_true", help="print only, send nothing")
    ap.add_argument("--test", action="store_true", help="send even if nothing is good")
    args = ap.parse_args(argv)
    test = args.test or os.environ.get("KITE_TEST", "").lower() == "true"

    cfg = json.loads(args.config.read_text())
    now = datetime.now(ZoneInfo(cfg.get("timezone", "Europe/Copenhagen"))).replace(tzinfo=None)
    results = run(cfg, now)
    if not results:
        print("error: no forecasts could be fetched", file=sys.stderr)
        return 1

    title, body = build_message(results)
    has_windows = any(ws for _, ws in results)
    if test:
        title = f"[test] {title}"
    print(f"{title}\n\n{body}")

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a") as f:
            f.write(f"## {title}\n\n```\n{body}\n```\n")

    if args.dry_run or not (has_windows or test):
        return 0
    sent = []
    if notify_ntfy(title, body, cfg):
        sent.append("ntfy")
    if notify_email(title, body):
        sent.append("email")
    if not sent:
        print("warning: no notifier configured (set NTFY_TOPIC and/or SMTP_* + EMAIL_TO)",
              file=sys.stderr)
        return 1
    print(f"sent via {', '.join(sent)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
