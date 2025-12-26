import { AbsoluteFill, Img, staticFile } from "remotion";
import { DigitalGlitchRGB } from "./DigitalGlitchRGB";

export const TriggeredComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0d0d" }}>
      <DigitalGlitchRGB
        // splitAmount: RGB channel offset in pixels during bursts
        //   2-3 = subtle misregistration
        //   4-6 = noticeable split (recommended)
        //   8+  = aggressive, stylized
        splitAmount={10}
        // blurAmount: blur radius during bursts
        //   0   = sharp edges only
        //   0.5-1 = slight softness (recommended)
        //   2+  = dreamy/unfocused
        blurAmount={0.5}
        // jitterAmount: global shake in pixels
        //   0-1 = stable
        //   1-2 = subtle instability (recommended)
        //   3+  = violent shake
        jitterAmount={0.5}
        // burstSpacing: average frames between glitch bursts
        //   15-20 = frequent bursts
        //   25-35 = balanced (recommended)
        //   45+   = sparse, dramatic
        burstSpacing={10}
        // burstDuration: [min, max] frames per burst
        //   [2, 3] = quick flickers
        //   [2, 5] = varied (recommended)
        //   [4, 8] = lingering glitches
        burstDuration={[10, 20]}
        seed={42}
      >
        <AbsoluteFill>
          <Img
            src={staticFile("girl-with-phone.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              top: "12%",
              width: "100%",
              textAlign: "center",
              fontFamily: "Impact, sans-serif",
              fontSize: 110,
              color: "#f8f5f0",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            CHROMATIC DOOM
          </div>
        </AbsoluteFill>
      </DigitalGlitchRGB>
    </AbsoluteFill>
  );
};
