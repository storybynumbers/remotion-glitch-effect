# @storybynumbers/remotion-glitch-effect

Digital glitch effect with RGB channel splitting for Remotion.

## Install

```bash
npm install @storybynumbers/remotion-glitch-effect
```

## Quick use

```tsx
import { DigitalGlitchRGB } from '@storybynumbers/remotion-glitch-effect';

<DigitalGlitchRGB splitAmount={5} blurAmount={0.8} burstSpacing={28}>
  <YourContent />
</DigitalGlitchRGB>
```

## Props (core)

- `splitAmount` (number, default 4) RGB offset in pixels
- `blurAmount` (number, default 0.8) Blur radius
- `jitterAmount` (number, default 1.5) Global shake in pixels
- `burstSpacing` (number, default 25) Avg frames between bursts
- `burstDuration` ([number, number], default [2, 5]) Min/max burst length
- `seed` (number, default 42) Deterministic randomization seed

Full docs and examples: https://github.com/storybynumbers/remotion-glitch-effect#readme
