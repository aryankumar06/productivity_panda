import { useMemo } from "react";
import { Player } from "@remotion/player";
import { LandingScene } from "@/components/ui/landing-scene";
import { CheckCircle, Zap, TrendingUp, Shield, Moon, Sun, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { RequestFeatureForm } from "./RequestFeatureForm";

function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  // LandingScene has no external props; memoised empty object avoids re-renders
  const playerProps = useMemo(() => ({}), []);

  const features = [
    {
      icon: <CheckCircle className="w-8 h-8 text-blue-500" />,
      title: "Task Management",
      description:
        "Organize your life with our intuitive task tracking system. Never miss a deadline again.",
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      title: "Habit Building",
      description:
        "Build lasting habits with daily tracking and streak monitoring. Small steps lead to big changes.",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-emerald-500" />,
      title: "Analytics & Insights",
      description:
        "Visualize your productivity trends. Understand your peak performance hours and improve.",
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: "Privacy Focused",
      description:
        "Your data is yours. We prioritize security and privacy, so you can focus on what matters.",
    },
  ];

  return (
    <div className="bg-neutral-950 min-h-screen relative text-white">
      {/* ── Top bar ── */}
      <div className="absolute top-0 right-0 p-6 z-20">
        <RequestFeatureForm
          variant="outline"
          className="bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10"
        />
      </div>
      <div className="absolute top-0 left-0 p-6 z-20">
        <Button
          variant="outline"
          className="bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 mr-2" />
          ) : (
            <Moon className="w-4 h-4 mr-2" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center pt-28 pb-10 px-4 overflow-hidden">
        {/* Subtle radial glow behind the player */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[900px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-4 mb-10 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Shipped · Now in production
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Productivity{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Hub
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto leading-relaxed">
            Your all-in-one workspace for tasks, habits, and progress — designed
            to keep you in flow.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-all hover:scale-105"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-white/80 hover:bg-white/5 transition-all"
            >
              Sign in
            </a>
          </div>
        </motion.div>

        {/* Pipeline animation player */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative z-10 w-full max-w-5xl"
        >
          <Player
            component={LandingScene as any}
            inputProps={playerProps}
            durationInFrames={360}
            fps={30}
            compositionWidth={1280}
            compositionHeight={720}
            autoPlay
            loop
            controls={false}
            clickToPlay={false}
            acknowledgeRemotionLicense
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: "16 / 9",
              borderRadius: 20,
              overflow: "hidden",
              background: "#050505",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), 0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(34,197,94,0.08)",
            }}
          />
          {/* Reflection shimmer */}
          <div className="absolute -bottom-6 left-4 right-4 h-20 bg-gradient-to-b from-emerald-500/10 to-transparent blur-2xl rounded-b-full pointer-events-none" />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Productivity Hub?
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto">
            Designed to help you focus, organize, and achieve your goals with a
            suite of powerful tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 p-6 rounded-2xl transition-all duration-300 group"
            >
              <div className="mb-4 p-3 bg-white/5 rounded-xl inline-block group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Productivity Hub</h3>
              <p className="text-sm text-white/40 mb-1">An EliteX Solutions Product</p>
              <p className="text-sm text-white/40">
                Empowering you to achieve more, every single day.
              </p>
            </div>
            <div className="md:text-right">
              <h3 className="text-lg font-bold text-white mb-2">Meet the developer —</h3>
              <p className="text-sm text-white/60 font-medium mb-1">Aryan Kumar</p>
              <div className="flex flex-wrap justify-start md:justify-end gap-4 text-sm text-white/40 mb-2">
                <a href="https://linkedin.com/in/aryankumar" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">LinkedIn</a>
                <a href="https://twitter.com/aryankumar" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">Twitter</a>
                <a href="https://instagram.com/aryankumar" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">Instagram</a>
                <a href="https://www.producthunt.com/posts/productivity-hub" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">Product Hunt</a>
              </div>
              <div className="text-sm text-white/40 space-y-1">
                <p>Contact: <a href="tel:9310479532" className="hover:text-white transition-colors">+91 9310479532</a></p>
                <p>Email: <a href="mailto:team@elitexsolutions.xyz" className="hover:text-white transition-colors">team@elitexsolutions.xyz</a></p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-sm">
              © {new Date().getFullYear()} EliteX Solutions. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-white/40">
              <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
