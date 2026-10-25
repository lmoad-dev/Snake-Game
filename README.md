# 🐍 Snake Pro Arcade

A modern, responsive, clean arcade Snake game created with **HTML5 Canvas**, **CSS3**, and **Vanilla JavaScript** (featuring procedural **Web Audio API** sound effects, customizable non-neon skins, and real-time speed controls).

---

## 🎮 How to Play

### Option 1: Direct in Browser
Open [`index.html`](file:///home/moad/Documents/snake%20Game/index.html) directly in any modern web browser (Chrome, Firefox, Edge, Safari).

### Option 2: Local HTTP Server
Run a local dev server:
```bash
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Move Snake** | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> | Virtual D-Pad or Swipe on canvas |
| **Adjust Speed Live** | <kbd>[</kbd> / <kbd>]</kbd> or <kbd>1</kbd>–<kbd>5</kbd> | Interactive Speed Slider or Preset Buttons |
| **Start / Play Again** | <kbd>Space</kbd> or <kbd>Enter</kbd> | Tap Start / Replay button |
| **Pause / Resume** | <kbd>Space</kbd> or <kbd>P</kbd> | Tap ⏸️ Pause button |
| **Mute / Unmute Audio** | <kbd>M</kbd> | Tap 🔊 Sound button |

---

## ✨ Features

- **Refined Non-Neon Design**: Modern matte dark-slate aesthetic with subtle depth, soft elevation shadows, and zero harsh neon glows.
- **Sleek Organic Snake Visuals**:
  - Smooth continuous slithering body with connected capsules and natural tapering towards the tail.
  - Expressive eyes with pupils that look forward in the movement direction and specular glints.
  - Animated forked red tongue that flickers out naturally.
- **5 Customizable Snake Skins**:
  - 🌿 **Emerald Viper** (Rich forest jade & emerald)
  - 🌑 **Obsidian Shadow** (Matte charcoal, slate & crimson eyes)
  - 🏜️ **Desert Python** (Amber, bronze & sapphire eyes)
  - 🔴 **Coral Banded** (Iconic crimson, jet-black & ivory bands)
  - ❄️ **Arctic Glacier** (Glacier blue, ice white & indigo eyes)
- **Interactive Real-Time Speed Controls**:
  - Range Slider from **Chill (150ms)** to **Ludicrous (40ms)**.
  - Instant Presets: *Chill*, *Relax*, *Normal*, *Fast*, *Ludicrous*.
  - Accessible anytime—even mid-game—via top header badge, slider, or hotkeys (`[` / `]` or `1`–`5`).
- **Dual Food Mechanics**:
  - 🍎 **Polished 3D Apple**: +1 point, snake grows.
  - ⭐ **Golden Bonus Gem**: Spawns every 5 apples with a dynamic circular timer ring (+5 points).
- **Web Audio API Synthesizer**: Procedural audio with eat chimes, bonus arpeggios, UI clicks, and defeat effects.
- **Clean Particle Engine**: Fluid particle bursts upon eating and gentle fragments on collision.
- **Responsive Layout**: Designed for seamless gameplay on desktop, tablets, and smartphones with an on-screen D-pad.
