"""Offline tests: python -m unittest discover kite-alert"""

import json
import unittest
from datetime import datetime, timedelta
from pathlib import Path

import kite_alert as ka

CFG = json.loads(Path(__file__).with_name("config.json").read_text())
EAST_SPOT = {"name": "East beach", "lat": 0, "lon": 0, "wind_sectors": [[10, 190]]}
NOW = datetime(2026, 11, 20, 6, 30)


def forecast(hours):
    """hours: list of (wind, gust, dir) starting 06:00 on NOW's day, daylight 08-16."""
    start = NOW.replace(hour=6, minute=0)
    times = [start + timedelta(hours=i) for i in range(len(hours))]
    return {
        "time": [t.strftime("%Y-%m-%dT%H:%M") for t in times],
        "wind_speed_10m": [h[0] for h in hours],
        "wind_gusts_10m": [h[1] for h in hours],
        "wind_direction_10m": [h[2] for h in hours],
        "temperature_2m": [7.0] * len(hours),
        "precipitation": [0.0] * len(hours),
        "weather_code": [3] * len(hours),
        "is_day": [1 if 8 <= t.hour < 16 else 0 for t in times],
    }


class SectorTests(unittest.TestCase):
    def test_plain_and_wrapping(self):
        self.assertTrue(ka.in_sector(90, [10, 190]))
        self.assertFalse(ka.in_sector(270, [10, 190]))
        self.assertTrue(ka.in_sector(350, [300, 30]))
        self.assertTrue(ka.in_sector(10, [300, 30]))
        self.assertFalse(ka.in_sector(180, [300, 30]))

    def test_compass(self):
        self.assertEqual(ka.compass(0), "N")
        self.assertEqual(ka.compass(359), "N")
        self.assertEqual(ka.compass(225), "SW")


class WindowTests(unittest.TestCase):
    rules = CFG["rules"]

    def windows(self, hours):
        return ka.find_windows(forecast(hours), EAST_SPOT, self.rules, NOW)

    def test_good_window_found(self):
        hours = [(18, 24, 90)] * 12  # 06:00-17:00, daylight 08-15
        [w] = self.windows(hours)
        self.assertEqual((w["start"].hour, w["end"].hour, w["hours"]), (8, 15, 8))
        self.assertEqual(w["dir"], "E")
        self.assertIn("08:00–16:00", ka.format_window(w))

    def test_offshore_wind_rejected(self):
        self.assertEqual(self.windows([(18, 24, 270)] * 12), [])

    def test_too_light_too_gusty_too_strong(self):
        self.assertEqual(self.windows([(10, 14, 90)] * 12), [])
        self.assertEqual(self.windows([(18, 34, 90)] * 12), [])  # spread 16
        self.assertEqual(self.windows([(35, 40, 90)] * 12), [])

    def test_short_window_dropped(self):
        hours = [(10, 12, 90)] * 3 + [(18, 22, 90)] + [(10, 12, 90)] * 8
        self.assertEqual(self.windows(hours), [])  # only 1 good hour (09:00)

    def test_thunder_rejected(self):
        f = forecast([(18, 24, 90)] * 12)
        f["weather_code"] = [95] * 12
        self.assertEqual(ka.find_windows(f, EAST_SPOT, self.rules, NOW), [])

    def test_past_hours_ignored(self):
        later = NOW.replace(hour=15)
        f = forecast([(18, 24, 90)] * 12)
        self.assertEqual(ka.find_windows(f, EAST_SPOT, self.rules, later), [])  # 15:00 only

    def test_spot_rule_override(self):
        spot = {**EAST_SPOT, "rules": {"min_wind_kn": 9}}
        rules = ka.spot_rules(CFG, spot)
        self.assertEqual(len(ka.find_windows(forecast([(10, 14, 90)] * 12), spot, rules, NOW)), 1)


class RunTests(unittest.TestCase):
    def test_run_and_message(self):
        cfg = {**CFG, "spots": [EAST_SPOT, {**EAST_SPOT, "name": "West beach",
                                            "wind_sectors": [[200, 300]]}]}
        results = ka.run(cfg, NOW, fetch=lambda s, c: forecast([(18, 24, 90)] * 12))
        title, body = ka.build_message(results)
        self.assertIn("1 window", title)
        self.assertIn("East beach", body)
        self.assertNotIn("West beach", body)

    def test_failed_fetch_is_skipped(self):
        def fetch(spot, cfg):
            raise OSError("boom")
        self.assertEqual(ka.run({**CFG, "spots": [EAST_SPOT]}, NOW, fetch=fetch), [])

    def test_nothing_good(self):
        title, _ = ka.build_message([(EAST_SPOT, [])])
        self.assertEqual(title, "No kite weather")


if __name__ == "__main__":
    unittest.main()
