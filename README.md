# Solar System 🪐

An interactive 3D model of the solar system, built with [three.js](https://threejs.org/)
for [Hack Club Polygon](https://polygon.hackclub.com/).

All eight planets orbit the Sun (plus Earth's Moon and Saturn's rings), each
wrapped in real NASA-derived surface textures. Drag to orbit the camera, scroll
to zoom, and click any planet to read about it.

## Features

- The Sun and all eight planets, in the right order and at sensible relative speeds
- Real surface textures on every body + a Milky Way starfield background
- Saturn's rings (built from `RingGeometry` with remapped UVs) and an orbiting Moon
- Click a planet for a quick fact card
- Toggle the orbit lines, pause the animation, and change the speed

## Geometry & textures used

- `SphereGeometry` — the Sun, planets, the Moon, and the starfield sky sphere
- `RingGeometry` — Saturn's rings
- `BufferGeometry` (`LineLoop`) — the orbit paths
- `Sprite` — the Sun's glow
- 11 image textures + one generated canvas texture for the glow

## Running it locally

There's no build step — it's plain HTML/CSS/JS with three.js pulled from a CDN.
Because it loads texture files, you do need to serve it over HTTP rather than
opening `index.html` directly (browsers block local file access for textures):

```bash
# any static server works, e.g.
python -m http.server 8000
# then open http://localhost:8000
```

## Credits

- 3D library: [three.js](https://threejs.org/)
- Planet textures: [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0)
