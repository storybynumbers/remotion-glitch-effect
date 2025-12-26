# @storybynumbers_/remotion-glitch-effect

Digital glitch effect with RGB channel splitting for Remotion.

## Install

```bash
npm install @storybynumbers_/remotion-glitch-effect
```

## Minimal use

```tsx
import { DigitalGlitchRGB } from '@storybynumbers_/remotion-glitch-effect';

<DigitalGlitchRGB>
  <YourContent />
</DigitalGlitchRGB>
```

## How it’s made (overview)

- Schedules sparse “bursts” up front using Remotion’s deterministic `random()` and a `seed`.
- During a burst, computes a quick intensity envelope and varies offsets per-frame (still deterministic).
- Renders three layers (R/G/B) and uses SVG filters: `feColorMatrix` to isolate channels, `feOffset` for separation, optional `feGaussianBlur` for softness.
- Composites layers with `mixBlendMode: 'screen'`.
- Outside bursts, renders children directly (no filters applied).

Implementation: `lib/DigitalGlitchRGB.tsx`.

## Props

- `splitAmount` (number, default 4) RGB offset in pixels
- `blurAmount` (number, default 0.8) Blur radius
- `jitterAmount` (number, default 1.5) Global shake in pixels
- `burstSpacing` (number, default 25) Avg frames between bursts
- `burstDuration` ([number, number], default [2, 5]) Min/max burst length
- `seed` (number, default 42) Deterministic randomization seed

Full docs and examples: https://github.com/storybynumbers/remotion-glitch-effect#readme
