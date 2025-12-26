import React, { useMemo, useId } from 'react';
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from 'remotion';

interface GlitchBurst {
  startFrame: number;
  duration: number;
  peakIntensity: number;
  seed: number;
}

interface DigitalGlitchRGBProps {
  children: React.ReactNode;
  /** Max RGB offset in pixels during bursts. Range: 2-8. Default: 4 */
  splitAmount?: number;
  /** Blur radius during bursts. Range: 0-2. Default: 0.8 */
  blurAmount?: number;
  /** Global jitter in pixels. Range: 0-3. Default: 1.5 */
  jitterAmount?: number;
  /** Average frames between bursts. Range: 15-45. Default: 25 */
  burstSpacing?: number;
  /** Burst duration range [min, max] in frames. Default: [2, 5] */
  burstDuration?: [number, number];
  /** Seed for deterministic randomization. Default: 42 */
  seed?: number;
}

/**
 * Attempt to generate a burst at each spacing interval.
 * Returns array of non-overlapping bursts.
 */
function generateBursts(
  totalFrames: number,
  spacing: number,
  durationRange: [number, number],
  seed: number
): GlitchBurst[] {
  const bursts: GlitchBurst[] = [];
  let frame = 0;
  let burstIndex = 0;

  while (frame < totalFrames) {
    const burstSeed = seed + burstIndex * 1000;

    // Jitter the start time within the spacing window
    const jitter = Math.floor((random(`burst-jitter-${burstSeed}`) - 0.5) * spacing * 0.6);
    const startFrame = Math.max(0, frame + Math.floor(spacing / 2) + jitter);

    // Random duration within range
    const duration = Math.floor(
      durationRange[0] +
        random(`burst-dur-${burstSeed}`) * (durationRange[1] - durationRange[0])
    );

    // Vary peak intensity (0.6 - 1.0)
    const peakIntensity = 0.6 + random(`burst-peak-${burstSeed}`) * 0.4;

    if (startFrame < totalFrames) {
      bursts.push({ startFrame, duration, peakIntensity, seed: burstSeed });
    }

    frame = startFrame + duration + Math.floor(spacing * 0.3); // Gap before next possible burst
    burstIndex++;
  }

  return bursts;
}

/**
 * Calculate glitch intensity g(t) for current frame.
 * Returns 0 when stable, 0-1 during bursts.
 * Fast attack, slightly slower decay.
 */
function getGlitchIntensity(frame: number, bursts: GlitchBurst[]): { intensity: number; burst: GlitchBurst | null } {
  for (const burst of bursts) {
    const { startFrame, duration, peakIntensity } = burst;
    const endFrame = startFrame + duration;

    if (frame >= startFrame && frame < endFrame) {
      const localFrame = frame - startFrame;

      // Fast attack (1 frame), plateau, slight decay (1 frame)
      let envelope = 1;
      if (localFrame === 0) {
        envelope = 0.7; // Quick ramp in
      } else if (localFrame === duration - 1 && duration > 2) {
        envelope = 0.5; // Slight decay out
      }

      return { intensity: peakIntensity * envelope, burst };
    }
  }

  return { intensity: 0, burst: null };
}

export const DigitalGlitchRGB: React.FC<DigitalGlitchRGBProps> = ({
  children,
  splitAmount = 4,
  blurAmount = 0.8,
  jitterAmount = 1.5,
  burstSpacing = 25,
  burstDuration = [2, 5],
  seed = 42,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const reactId = useId();

  const filterId = useMemo(
    () => `glitch-rgb-${reactId.replace(/:/g, '')}`,
    [reactId]
  );

  // Pre-generate burst schedule (memoized, doesn't change during playback)
  const bursts = useMemo(
    () => generateBursts(durationInFrames, burstSpacing, burstDuration, seed),
    [durationInFrames, burstSpacing, burstDuration, seed]
  );

  // Get current glitch state
  const { intensity, burst } = getGlitchIntensity(frame, bursts);
  const isGlitching = intensity > 0 && burst !== null;

  // Per-frame noise for variation within bursts
  const frameSeed = burst ? burst.seed + frame : seed + frame;

  // RGB channel offsets (unequal to avoid pure "camera shake" look)
  // Red shifts right/up, Blue shifts left/down, Green stays centered
  const redOffsetX = isGlitching
    ? intensity * splitAmount * (0.8 + random(`r-ox-${frameSeed}`) * 0.4)
    : 0;
  const redOffsetY = isGlitching
    ? intensity * splitAmount * 0.3 * (random(`r-oy-${frameSeed}`) - 0.3)
    : 0;
  const blueOffsetX = isGlitching
    ? -intensity * splitAmount * (0.8 + random(`b-ox-${frameSeed}`) * 0.4)
    : 0;
  const blueOffsetY = isGlitching
    ? intensity * splitAmount * 0.3 * (random(`b-oy-${frameSeed}`) - 0.7)
    : 0;

  // Global micro-jitter (applies to whole image)
  const globalJitterX = isGlitching
    ? intensity * jitterAmount * (random(`jit-x-${frameSeed}`) * 2 - 1)
    : 0;
  const globalJitterY = isGlitching
    ? intensity * jitterAmount * (random(`jit-y-${frameSeed}`) * 2 - 1)
    : 0;

  // Small scale pulse during bursts
  const scalePulse = isGlitching
    ? 1 + intensity * 0.003 * (random(`scale-${frameSeed}`) * 2 - 1)
    : 1;

  // Blur radius
  const blur = isGlitching ? intensity * blurAmount : 0;

  // When not glitching, render children directly (no filter overhead)
  if (!isGlitching) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  return (
    <AbsoluteFill>
      {/* SVG filter definitions */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          {/* Red channel: extract + offset */}
          <filter id={`${filterId}-red`} x="-10%" y="-10%" width="120%" height="120%">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
            />
            <feOffset dx={redOffsetX} dy={redOffsetY} />
            {blur > 0 && <feGaussianBlur stdDeviation={blur * 0.5} />}
          </filter>

          {/* Green channel: extract only (stable) */}
          <filter id={`${filterId}-green`}>
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
            />
            {blur > 0 && <feGaussianBlur stdDeviation={blur * 0.3} />}
          </filter>

          {/* Blue channel: extract + offset */}
          <filter id={`${filterId}-blue`} x="-10%" y="-10%" width="120%" height="120%">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
            />
            <feOffset dx={blueOffsetX} dy={blueOffsetY} />
            {blur > 0 && <feGaussianBlur stdDeviation={blur * 0.5} />}
          </filter>
        </defs>
      </svg>

      {/* Jittered container */}
      <AbsoluteFill
        style={{
          transform: `translate(${globalJitterX}px, ${globalJitterY}px) scale(${scalePulse})`,
        }}
      >
        {/* Red layer */}
        <AbsoluteFill style={{ filter: `url(#${filterId}-red)`, mixBlendMode: 'screen' }}>
          {children}
        </AbsoluteFill>

        {/* Green layer (stable reference) */}
        <AbsoluteFill style={{ filter: `url(#${filterId}-green)`, mixBlendMode: 'screen' }}>
          {children}
        </AbsoluteFill>

        {/* Blue layer */}
        <AbsoluteFill style={{ filter: `url(#${filterId}-blue)`, mixBlendMode: 'screen' }}>
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
