# VISUALS/aseptic-filling-line

Standalone, interactive visualisation of an aseptic vial filling line (pharma, EU GMP Annex 1).
One file, no build: open `index.html` in a browser. Fonts load from Google Fonts; everything else is inline.

- Canvas side view of the line: compounding and sterile filtration, washer, depyrogenation tunnel,
  Grade A isolator (fill + 100 % IPC, stoppering), capping, AVI with reject gate, labelling, packing,
  with utilities (WFI loop, clean steam, HVAC) in the mezzanine above.
- Simulation state lives in `S`; world geometry constants (`CY`, `FZ0`, `CAP_X`, ...) sit at the top.
- Changeover strategies (`STRATS`) run CIP/SIP/VHP phases in time-lapse; `real` is minutes shown to the user.
- Station copy is in `INFO`, supporting-process cards in `CARDS`, efficiency levers in `LEVERS`.
- Colours come from CSS tokens (light and dark) and are read into `P` for the canvas.
- All numbers on the page are simulated and illustrative.
