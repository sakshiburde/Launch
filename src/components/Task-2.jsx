import React, { useRef, useState } from 'react';

//css
const styles = `
/* GLOBAL LAYOUT & DARK MODE */
.hero-section {
    display: flex;
    justify-content: space-around;
    align-items: center;
    min-height: 100vh;
    padding: 60px 10%;
    
    background-color: #05060A; 
    background-image: radial-gradient(circle at center, #181c2e 0%, #05060A 85%);
    color: #f0f0f0; 
    
    overflow: hidden; 
    position: relative;
    user-select: none;
    font-family: 'Segoe UI', Roboto, sans-serif; 
}

.content-container {
    max-width: 400px;
}

.content-container h1 {
    font-size: 3.8em; 
    margin-bottom: 0.1em;
    font-weight: 800; 
    letter-spacing: -0.04em; 
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.1); 
}

.content-container p {
    font-size: 1.3em; 
    color: #b0b0b0; 
    margin-bottom: 2em;
    line-height: 1.5;
}

/* CTA Buttons */
.cta-buttons button {
    padding: 14px 30px; 
    margin-right: 15px;
    border: none; 
    border-radius: 10px; 
    font-weight: 600; 
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.05em; 
}

.cta-primary {
    background: linear-gradient(90deg, #007bff, #00c6ff); 
    color: white;
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.5),
                2px 2px 10px rgba(255, 0, 0, 0.2), 
                -2px -2px 10px rgba(0, 0, 255, 0.2); 
}
.cta-primary:hover {
    background: linear-gradient(90deg, #00c6ff, #007bff); 
    box-shadow: 0 10px 30px rgba(0, 123, 255, 0.7);
    transform: translateY(-3px);
}

.cta-secondary {
    background: transparent;
    border: 1px solid rgba(0, 123, 255, 0.5); 
    color: #00c6ff;
}
.cta-secondary:hover {
    background-color: rgba(0, 123, 255, 0.1);
    transform: translateY(-3px);
}


/* 3D SCENE SETUP */
.hero-scene {
    perspective: 1200px; 
    position: relative;
    width: 500px; 
    height: 500px;
}

/* MAIN 3D OBJECT (PHONE) */
.phone-mockup {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 280px;
    height: 400px;
    border-radius: 40px;
    
    background: linear-gradient(145deg, rgba(15, 15, 20, 0.95), rgba(30, 30, 40, 0.98));
    border: 1px solid rgba(255, 255, 255, 0.05); 
    
    box-shadow: 
        0 80px 200px rgba(0, 0, 0, 0.95), 
        0 0 100px rgba(0, 123, 255, 0.15), 
        -15px -15px 60px rgba(255, 255, 255, 0.1) inset, 
        15px 15px 60px rgba(0, 0, 0, 0.3) inset; 
    
    transform-style: preserve-3d;
    transition: transform 0.1s linear; 
    overflow: hidden; 
}

/* PHONE SCREEN CONTENT */
.phone-screen {
    position: absolute;
    top: 10px; 
    left: 10px;
    width: 260px;
    height: 380px;
    border-radius: 30px;
    
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.7));
    border: 1px solid rgba(255, 255, 255, 0.25); 
    
    box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.1), 
                0 0 30px rgba(0, 123, 255, 0.1); 

    padding: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    
    backdrop-filter: blur(12px) brightness(1.1); 
    -webkit-backdrop-filter: blur(12px) brightness(1.1);
}

.dashboard-title {
    color: #ffffff; 
    font-size: 1.1em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.9;
}

.asset-value {
    font-size: 2.4em; 
    font-weight: 800;
    color: #9933ff;
    text-shadow: 0 0 20px rgba(153, 51, 255, 0.8); 
}

/* HI-FI CHART UI */
.chart-area {
    width: 100%;
    height: 150px;
    border: none;
    background: rgba(13, 17, 23, 0.5); 
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.7); 
}
.chart-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 0.8em;
    color: #909090;
    margin-bottom: 5px;
}
.chart-header span:last-child {
    color: #00ff7f;
    font-weight: 600;
}

.chart-data-line {
    position: absolute;
    bottom: 0;
    width: 150%;
    height: 100px;
    background: linear-gradient(to right, transparent, rgba(0, 255, 127, 0.4), rgba(0, 198, 255, 0.4), transparent); 
    clip-path: polygon(0 100%, 20% 50%, 40% 70%, 60% 30%, 80% 60%, 100% 0, 100% 100%);
    animation: pulse-chart 4s infinite alternate;
}
.chart-grid {
    position: absolute;
    top: 10%;
    left: 0;
    width: 100%;
    height: 80%;
    background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 25% 25%;
    opacity: 0.3;
}


.action-button {
    padding: 10px 20px; 
    background: linear-gradient(90deg, #00c6ff, #9933ff);
    color: white;
    border: none;
    border-radius: 25px; 
    font-size: 1em;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 5px 20px rgba(153, 51, 255, 0.6); 
    transition: all 0.3s ease;
}
.action-button:hover {
    box-shadow: 0 8px 25px rgba(153, 51, 255, 0.8);
    transform: translateY(-2px);
}

/* 3D ORBIT CONTAINER */
.orbit-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 1px;
    transform-style: preserve-3d;
    transform: translate(-50%, -50%) translateZ(50px); 
    animation: orbit 30s linear infinite; 
}


/* FLOATING NEON ELEMENTS (COINS) */
.floating-element {
    position: absolute; 
    top: 0;
    left: 0;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2.5em;
    font-weight: 900;
    
    background: rgba(0, 0, 0, 0.6); 
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.8); 
    border: 1px solid rgba(255,255,255,0.1); 
}

/* Symbol Metallic Effect */
.coin-symbol {
    text-shadow: 
        1px 1px 1px rgba(0,0,0,0.8), 
        -1px -1px 2px rgba(255,255,255,0.5), 
        0 0 10px var(--neon-color),
        0 0 20px var(--neon-color-dark);
}

.coin-offset-wrapper {
    transform: translateZ(var(--z-start)) rotateY(var(--rot));
    transform-style: preserve-3d;
    height: 100%;
    width: 100%;
    animation: float 8s ease-in-out infinite, spin 12s linear infinite;
}

/* Neon Colors and Shadow Effects */
.neon-green { --neon-color: #00ff7f; --neon-color-dark: #00cc66; color: var(--neon-color); }
.neon-pink  { --neon-color: #ff69b4; --neon-color-dark: #cc5599; color: var(--neon-color); }
.neon-blue  { --neon-color: #00c6ff; --neon-color-dark: #0099cc; color: var(--neon-color); }
.neon-purple{ --neon-color: #9933ff; --neon-color-dark: #7722cc; color: var(--neon-color); }


/* KEYFRAME ANIMATIONS */
@keyframes float {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-15px);
    }
}

@keyframes spin {
    0% { transform: rotateZ(0deg); }
    100% { transform: rotateZ(360deg); }
}

@keyframes orbit {
    from {
        transform: rotateY(0deg) translate(-50%, -50%) translateZ(50px); 
    }
    to {
        transform: rotateY(360deg) translate(-50%, -50%) translateZ(50px); 
    }
}
@keyframes pulse-chart {
    0% { opacity: 0.7; } 
    100% { opacity: 1; }
}

/* ---------------------------------- */
/* RESPONSIVENESS: MOBILE ADJUSTMENTS */
/* ---------------------------------- */
@media (max-width: 768px) {
    .hero-section {
        flex-direction: column; 
        padding: 40px 5%;
        min-height: auto; 
        text-align: center;
    }

    .content-container {
        max-width: 90%; 
        margin-bottom: 40px;
    }

    .content-container h1 {
        font-size: 2.2em; 
        letter-spacing: normal;
    }

    .content-container p {
        font-size: 1em; 
        margin-bottom: 1.5em;
    }

    .cta-buttons {
        display: flex;
        flex-direction: column; 
        gap: 10px;
        align-items: center;
    }

    .cta-buttons button {
        width: 80%; 
        padding: 12px 20px;
        margin-right: 0;
    }

    /* 3D SCENE SCALING */
    .hero-scene {
        width: 90vw; 
        height: 60vh;
        max-width: 400px; 
        max-height: 400px;
        margin-left: auto;
        margin-right: auto;
    }

    /* SCALE DOWN THE PHONE AND ORBIT SYSTEM */
    .phone-mockup {
        transform: translate(-50%, -50%) scale(0.7) translateZ(55px);
        transition: none; 
    }
    
    .phone-mockup[style*="rotate"] {
         transform: translate(-50%, -50%) scale(0.7) 
                   rotateY(var(--y-rot, 0deg)) 
                   rotateX(var(--x-rot, 0deg)) 
                   translateZ(55px);
    }

    .orbit-container {
        transform: translate(-50%, -50%) scale(0.7) translateZ(50px);
    }
}
`;

//react
const Task_2 = () => {
  const sceneRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 }); 

  const handleMouseMove = (e) => {
    if (!sceneRef.current) return;

    const rect = sceneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    const maxRot = 10; 

    const rotateY = -x * maxRot; 
    const rotateX = y * maxRot; 

    setRotation({ x: rotateX.toFixed(2), y: rotateY.toFixed(2) });
  };
  
  // Adjusted phoneStyle to use CSS variables for rotation so the mobile media query can override
  const phoneStyle = {
    '--x-rot': `${rotation.x}deg`,
    '--y-rot': `${rotation.y}deg`,
    transform: `
      translate(-50%, -50%) 
      rotateY(${rotation.y}deg) 
      rotateX(${rotation.x}deg) 
      translateZ(55px) 
    `,
  };

  const coinData = [
    { id: 1, symbol: '₿', className: 'coin-btc neon-green', style: { '--z-start': '20px', '--rot': '10deg', top: '-150px', left: '100px', animationDelay: '0s' } }, 
    { id: 2, symbol: '€', className: 'coin-eur neon-pink', style: { '--z-start': '-10px', '--rot': '-20deg', top: '150px', left: '-100px', animationDelay: '4s' } },
    { id: 3, symbol: '¥', className: 'coin-jpy neon-blue', style: { '--z-start': '-40px', '--rot': '30deg', top: '0px', left: '-200px', animationDelay: '2s' } },
    { id: 4, symbol: '£', className: 'coin-gbp neon-purple', style: { '--z-start': '30px', '--rot': '-50deg', top: '200px', left: '200px', animationDelay: '6s' } }, 
    
    { id: 5, symbol: '₿', className: 'coin-btc neon-green', style: { '--z-start': '10px', '--rot': '60deg', top: '-50px', left: '180px', animationDelay: '1s' } }, 
    { id: 6, symbol: '€', className: 'coin-eur neon-pink', style: { '--z-start': '-100px', '--rot': '-70deg', top: '20px', left: '-150px', animationDelay: '5s' } }, 
    { id: 7, symbol: '¥', className: 'coin-jpy neon-blue', style: { '--z-start': '-20px', '--rot': '0deg', top: '-200px', left: '0px', animationDelay: '3s' } }, 
    { id: 8, symbol: '£', className: 'coin-gbp neon-purple', style: { '--z-start': '-80px', '--rot': '-10deg', top: '50px', left: '250px', animationDelay: '7s' } }, 
  ];

  return (
    <>
      {/* Inject the CSS styles */}
      <style>{styles}</style>
      
      <div 
        className="hero-section"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setRotation({ x: 0, y: 0 })}
        ref={sceneRef}
      >
        <div className="content-container">
          <h1>Limitless Possibilities</h1>
          <p>The Future of Investments, Built on Speed and Transparency.</p>
          <div className="cta-buttons">
              <button className="cta-primary">Launch Dashboard</button>
              <button className="cta-secondary">Request Demo</button>
          </div>
        </div>

        <div className="hero-scene">
          
          {/* 1. ORBIT CONTAINER: RENDERED FIRST */}
          <div className="orbit-container">
            
            {/* Floating/Animated Glowing Elements */}
            {coinData.map((coin) => (
              <div 
                key={coin.id}
                className={`floating-element ${coin.className}`} 
                style={{top: coin.style.top, left: coin.style.left}} 
              >
                {/* WRAPPER: Handles Z-depth and individual animations */}
                <div 
                    className="coin-offset-wrapper" 
                    style={{'--z-start': coin.style['--z-start'], '--rot': coin.style['--rot'], animationDelay: coin.style.animationDelay}}
                >
                    <span className="coin-symbol">{coin.symbol}</span>
                </div>
              </div>
            ))}

          </div> {/* End orbit-container */}
          
          {/* 2. PHONE MOCKUP: RENDERED LAST (Acts as the occluder) */}
          <div className="main-3d-object phone-mockup" style={phoneStyle}>
            
            {/* PHONE SCREEN WITH DASHBOARD CONTENT */}
            <div className="phone-screen">
              <div className="dashboard-title">My Total Portfolio Value</div>
              
              <div className="asset-value">$42,567.89</div>
              
              {/* HI-FI CHART UI */}
              <div className="chart-area">
                <div className="chart-grid"></div>
                <div className="chart-header">
                    <span>Performance (24H)</span>
                    <span>+3.4%</span>
                </div>
                <div className="chart-data-line"></div>
              </div>
              
              <button className="action-button">Trade Now</button>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default Task_2;