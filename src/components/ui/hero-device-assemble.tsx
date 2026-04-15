import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface HeroDeviceAssembleProps {
  assembleStart?: number;
  device?: "laptop" | "phone";
  screenContent?: React.ReactNode;
  accentColor?: string;
  speed?: number;
  className?: string;
  theme?: 'light' | 'dark';
}

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function MockUI({ accentColor, theme }: { accentColor: string, theme: 'light' | 'dark' }) {
  const isLight = theme === 'light';
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: isLight ? "#ffffff" : "#0b0b0f",
        fontFamily: FONT_FAMILY,
        color: isLight ? "black" : "white",
        overflow: "hidden",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: "10%",
          background: isLight ? "#f1f5f9" : "#111118",
          borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 8,
        }}
      >
        {["rgba(255,255,255,0.18)", "rgba(255,255,255,0.18)", "rgba(255,255,255,0.18)"].map(
          (bg, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: bg }} />
          )
        )}
      </div>

      <div style={{ flex: 1, display: "flex" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "22%",
            background: "#0e0e14",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ height: 12, borderRadius: 4, background: accentColor, opacity: 0.85, width: "70%" }} />
          <div style={{ height: 10, borderRadius: 4, background: "rgba(255,255,255,0.1)", width: "85%" }} />
          <div style={{ height: 10, borderRadius: 4, background: "rgba(255,255,255,0.08)", width: "60%" }} />
          <div style={{ height: 10, borderRadius: 4, background: "rgba(255,255,255,0.08)", width: "75%" }} />
        </div>

        {/* Content */}
        <div
          style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div style={{ height: 18, width: "40%", background: "rgba(255,255,255,0.85)", borderRadius: 4 }} />
          <div style={{ height: 10, width: "65%", background: "rgba(255,255,255,0.18)", borderRadius: 4 }} />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}
          >
            <div style={{ height: 90, borderRadius: 8, background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.06)" }} />
            <div style={{ height: 90, borderRadius: 8, background: `linear-gradient(180deg, ${accentColor}33, ${accentColor}11)`, border: `1px solid ${accentColor}55` }} />
            <div style={{ height: 90, borderRadius: 8, background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.06)" }} />
          </div>
          <div style={{ flex: 1, borderRadius: 8, background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.06)" }} />
        </div>
      </div>
    </div>
  );
}

export function HeroDeviceAssemble({
  assembleStart = 0,
  device = "laptop",
  accentColor = "#22c55e",
  speed = 1,
  className,
  screenContent,
  theme = 'dark',
}: HeroDeviceAssembleProps) {
  const frame = useCurrentFrame() * speed;
  const { fps } = useVideoConfig();

  const assemble = spring({
    frame: frame - assembleStart,
    fps,
    config: { mass: 1.4, damping: 12, stiffness: 90 },
    durationInFrames: 60,
  });

  const lidZ   = interpolate(assemble, [0, 1], [1000, 0]);
  const baseZ  = interpolate(assemble, [0, 1], [-800, 0]);
  const bezelZ = interpolate(assemble, [0, 1], [600, 0]);
  const screenZ = interpolate(assemble, [0, 1], [300, 0]);

  const rotX = interpolate(assemble, [0, 1], [-22, 0]);
  const rotY = interpolate(assemble, [0, 1], [28, 0]);

  const layerOpacity = interpolate(assemble, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const settleFrame = assembleStart + 45;
  const screenWake = interpolate(frame, [settleFrame, settleFrame + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shimmerProgress = interpolate(
    frame,
    [settleFrame + 6, settleFrame + 30],
    [-1, 2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const isPhone = device === "phone";
  const deviceW = isPhone ? 320 : 760;
  const deviceH = isPhone ? 640 : 470;
  const screenInset = isPhone ? 12 : 18;
  const bezelRadius = isPhone ? 36 : 14;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: theme === 'light' 
          ? "radial-gradient(ellipse at center, #f8fafc 0%, #f1f5f9 70%)" 
          : "radial-gradient(ellipse at center, #1a1a22 0%, #050507 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 2000,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          position: "relative",
          width: deviceW,
          height: deviceH,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          willChange: "transform",
        }}
      >
        {/* Back lid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateZ(${lidZ - 8}px)`,
            background: theme === 'light' ? "linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)" : "linear-gradient(180deg, #1f2128 0%, #0e1014 100%)",
            borderRadius: bezelRadius + 4,
            border: theme === 'light' ? "1px solid #94a3b8" : "1px solid rgba(255,255,255,0.08)",
            boxShadow: theme === 'light' 
              ? "0 30px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)"
              : "0 60px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
            opacity: layerOpacity,
          }}
        />

        {/* Keyboard base (laptop only) */}
        {!isPhone && (
          <div
            style={{
              position: "absolute",
              left: -40,
              right: -40,
              bottom: -28,
              height: 28,
              transform: `translateZ(${baseZ}px) rotateX(78deg)`,
              transformOrigin: "top center",
              background: theme === 'light' ? "linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)" : "linear-gradient(180deg, #2a2d36 0%, #14161c 100%)",
              borderRadius: "0 0 12px 12px",
              border: theme === 'light' ? "1px solid #94a3b8" : "1px solid rgba(255,255,255,0.06)",
              boxShadow: theme === 'light' ? "0 20px 40px rgba(0,0,0,0.15)" : "0 30px 60px rgba(0,0,0,0.6)",
              opacity: layerOpacity,
            }}
          />
        )}

        {/* Bezel frame */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateZ(${bezelZ}px)`,
            background: theme === 'light' ? "#0f172a" : "#0a0a0d",
            borderRadius: bezelRadius,
            border: theme === 'light' ? "1px solid #334155" : "1px solid rgba(255,255,255,0.12)",
            boxShadow: theme === 'light' 
              ? "inset 0 0 0 2px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.2)"
              : "inset 0 0 0 2px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.5)",
            opacity: layerOpacity,
          }}
        />

        {/* UI screen */}
        <div
          style={{
            position: "absolute",
            inset: screenInset,
            transform: `translateZ(${screenZ}px)`,
            borderRadius: bezelRadius - 6,
            overflow: "hidden",
            background: "black",
            opacity: layerOpacity,
          }}
        >
          {/* Black during flight */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#000",
              opacity: 1 - screenWake,
            }}
          />
          {/* Screen content fades in after wake */}
          <div style={{ position: "absolute", inset: 0, opacity: screenWake, background: theme === 'light' ? '#fff' : '#000' }}>
            {screenContent ?? <MockUI accentColor={accentColor} theme={theme} />}
          </div>
          {/* Shimmer sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)`,
              transform: `translateX(${shimmerProgress * 100}%)`,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
