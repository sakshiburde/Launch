
import React, { useState, useEffect, useCallback } from "react";


import Task_1 from "./components/Task-1";


import Task_2 from "./components/Task-2";

function App() {
  const [isTimelineActive, setIsTimelineActive] = useState(false);

  const handleTimelineActiveChange = useCallback((isActive) => {
    setIsTimelineActive(isActive);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousTouch = document.body.style.touchAction;

    if (isTimelineActive) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = previousOverflow || "auto";
      document.body.style.touchAction = previousTouch || "";
    };
  }, [isTimelineActive]);


  return (
    <div
      className="app-root"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgba(6,8,20,1) 0%, rgba(12,10,26,1) 60%)",
        color: "#fff",
        fontFamily:
          'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      }}
    >
      <a
        href="#main"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        Skip to main
      </a>

      <header style={{ padding: "28px 24px" }}>
        <Task_2 />
      </header>

      <main
        id="main"
        style={{
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 28,
        }}
      >
        <Task_1
          onTimelineActiveChange={handleTimelineActiveChange}
          premium={true}
          compact={false}
          heightMultiplier={1.0}
          radius={900}
          pxPerIcon={150}
          safeTopInset={28}
          centerOffset={-18}

          mobileBreakpoint={640}
          mobileMaxIcons={5}
          mobileRadius={220}
          mobilePxPerIcon={110}
          mobileItemSize={72}

        />
      </main>

      <section
        aria-label="More content"
        style={{
          padding: "56px 24px",
          maxWidth: 1100,
          margin: "0 auto",
          lineHeight: 1.8,
          fontSize: 18,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        <div
          style={{
            height: 1200,
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.02), rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.02) 40%)",
            borderRadius: 12,
            marginTop: 24,
            boxShadow: "inset 0 6px 24px rgba(0,0,0,0.6)",
          }}
        />
      </section>

      <footer
        style={{
          padding: "32px 24px",
          textAlign: "center",
          opacity: 0.95,
          borderTop: "1px solid rgba(255,255,255,0.03)",
          marginTop: 30,
        }}
      >
        © {new Date().getFullYear()} Your Company · Demo
      </footer>
    </div>
  );
}

export default App;