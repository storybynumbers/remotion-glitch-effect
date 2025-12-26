# @storybynumbers_/remotion-glitch-effect

Digital glitch effect with RGB channel splitting for Remotion.

## Installation

```bash
npm install @storybynumbers_/remotion-glitch-effect
```

## Minimal usage

```tsx
import { DigitalGlitchRGB } from '@storybynumbers_/remotion-glitch-effect';

<DigitalGlitchRGB>
  <YourContent />
</DigitalGlitchRGB>
```

## How it’s made

This effect is intentionally “no fancy pipeline”: it’s built from SVG filters, a burst scheduler, and deterministic per-frame variation.

### 1) Bursts instead of always-on noise

Rather than wiggling every frame, the component creates short glitch windows (“bursts”) separated by calm periods:

- `generateBursts(totalFrames, burstSpacing, burstDuration, seed)` produces a list of non-overlapping bursts.
- Each burst has a `startFrame`, `duration`, `peakIntensity`, and its own derived `seed`.
- Bursts are created with Remotion’s `random()` using string keys (for deterministic randomness).

During playback, `getGlitchIntensity(frame, bursts)` returns:

- `0` outside any burst (stable).
- `0..1` inside a burst, using a simple envelope (fast attack, slight decay).

### 2) Per-frame variation, but still reproducible

Inside a burst, each frame uses a derived seed (`burst.seed + frame`) to vary offsets and jitter. With the same input `seed`, renders remain reproducible across machines and over time.

### 3) RGB split using SVG filters

When glitching, we render three stacked layers of the same children:

- Red layer: extract red via `feColorMatrix`, then offset with `feOffset`.
- Green layer: extract green and keep centered (acts as a stable reference).
- Blue layer: extract blue and offset (in the opposite direction).

Blur is applied only during bursts (`feGaussianBlur`) to soften harsh edges and make the split read more like “signal processing” than three crisp copies.

Finally, the layers are composited with `mixBlendMode: 'screen'` so channel separation stays bright and punchy.

### 4) Performance: no work when stable

Outside bursts, the component returns `<AbsoluteFill>{children}</AbsoluteFill>` and applies no SVG filter work at all.

### 5) Avoiding filter ID collisions

Each instance uses `useId()` to build a unique filter ID, so multiple glitches can exist on the same page without clobbering each other’s SVG definitions.

Implementation lives in `lib/DigitalGlitchRGB.tsx`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `splitAmount` | `number` | `4` | RGB offset in pixels (2-8 recommended) |
| `blurAmount` | `number` | `0.8` | Blur radius (0-2 recommended) |
| `jitterAmount` | `number` | `1.5` | Global shake in pixels (0-3 recommended) |
| `burstSpacing` | `number` | `25` | Average frames between bursts (15-45) |
| `burstDuration` | `[number, number]` | `[2, 5]` | Min/max burst length in frames |
| `seed` | `number` | `42` | Deterministic randomization seed |

## Notes

- This package targets “digital interference”: small, sparse bursts tend to look better than constant distortion.
- If you want a consistent look across multiple shots, keep `seed` fixed per shot (or derive it from a stable ID).

## Requirements

- `remotion`: ^4.0.0
- `react`: ^18.0.0

## License

MIT
