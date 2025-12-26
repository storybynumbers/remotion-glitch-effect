# remotion-digital-glitch-rgb

Digital glitch effect with RGB channel splitting for Remotion.

## Installation

```bash
npm install remotion-digital-glitch-rgb
```

## Usage

```tsx
import { DigitalGlitchRGB } from 'remotion-digital-glitch-rgb';

<DigitalGlitchRGB
  splitAmount={5}
  blurAmount={0.8}
  burstSpacing={28}
>
  <YourContent />
</DigitalGlitchRGB>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `splitAmount` | `number` | `4` | RGB offset in pixels (2-8 recommended) |
| `blurAmount` | `number` | `0.8` | Blur radius (0-2 recommended) |
| `jitterAmount` | `number` | `1.5` | Global shake in pixels (0-3 recommended) |
| `burstSpacing` | `number` | `25` | Average frames between bursts (15-45) |
| `burstDuration` | `[number, number]` | `[2, 5]` | Min/max burst length in frames |
| `seed` | `number` | `42` | Deterministic randomization seed |

## Examples

**Subtle phone interference**
```tsx
<DigitalGlitchRGB splitAmount={3} blurAmount={0.5} burstSpacing={35}>
  {children}
</DigitalGlitchRGB>
```

**Aggressive glitch**
```tsx
<DigitalGlitchRGB splitAmount={7} jitterAmount={2.5} burstSpacing={18}>
  {children}
</DigitalGlitchRGB>
```

## How It Works

- Splits RGB channels using SVG filters (`feOffset`)
- Pre-computes burst schedule for sparse, timed glitches
- Per-frame variation within bursts for organic feel
- Zero overhead when stable (no filters applied)
- Fully deterministic (reproducible renders)

## Requirements

- `remotion`: ^4.0.0
- `react`: ^18.0.0

## License

MIT
