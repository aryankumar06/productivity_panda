import { HeroDeviceAssemble } from "@/components/ui/hero-device-assemble";
import { PipelineJourney } from "@/components/ui/pipeline-journey";

/**
 * Scale maths:
 *  • Laptop device = 760 × 470 px  (inside the 1280×720 composition)
 *  • Screen inset  = 18 px each side
 *  • Screen area   ≈ 724 × 434 px
 *  • PipelineJourney is designed for 1280 × 720
 *  • Scale = 724 / 1280 ≈ 0.565  → all 3 columns + flying card fit neatly
 */
const PIPELINE_W = 1280;
const PIPELINE_H = 720;
const SCREEN_W   = 724;   // 760 - 2 * 18  (approx)
const SCREEN_H   = 434;   // 470 - 2 * 18  (approx)
const SCALE_X    = SCREEN_W / PIPELINE_W;   // ≈ 0.566
const SCALE_Y    = SCREEN_H / PIPELINE_H;   // ≈ 0.603

// Use the smaller axis so the board never overflows
const SCALE = Math.min(SCALE_X, SCALE_Y);   // 0.566

const ScaledSprintBoard = ({ theme }: { theme: 'light' | 'dark' }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: theme === 'dark' ? "#09090b" : "#ffffff" }}>
    {/* Fixed-size inner box scaled from top-left to exactly fill the screen */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width:  PIPELINE_W,
        height: PIPELINE_H,
        transform: `scale(${SCALE})`,
        transformOrigin: "top left",
      }}
    >
      <PipelineJourney
        theme={theme}
        cardLabel="Build pipeline"
        accentColor="#22c55e"
        speed={1}
      />
    </div>
  </div>
);

/**
 * LandingScene — single Remotion composition (360 frames @ 30 fps = 12 s loop).
 *
 * Frames  0 –  63  : Laptop assembles in 3D, screen is black
 * Frame  ~63        : Screen wakes (shimmer sweep)
 * Frames ~63 – 360 : Sprint board plays INSIDE the laptop display, all 3 columns visible
 */
export function LandingScene({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <HeroDeviceAssemble
      theme={theme}
      assembleStart={0}
      device="laptop"
      accentColor="#22c55e"
      speed={1}
      screenContent={<ScaledSprintBoard theme={theme} />}
    />
  );
}
