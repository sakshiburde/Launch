import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import './Task-2.css';

const floatingItems = [
  { id: 1, label: '₹' },
  { id: 2, label: '💰' },
  { id: 3, label: '$' },
  { id: 4, label: '◎' },
  { id: 5, label: '●' },
  { id: 6, label: '◯' },
];

function Task_2() {
  const sectionRef = useRef(null);
  const mountRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end start'],
  });

  const cardRotateX = useTransform(scrollYProgress, [0, 1], [12, -12]);
  const cardRotateY = useTransform(scrollYProgress, [0, 1], [-14, 10]);
  const cardTranslateY = useTransform(scrollYProgress, [0, 1], [30, -10]);
  const cardScale = useTransform(scrollYProgress, [0, 1], [0.98, 1.03]);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.0025);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Version-tolerant color-space setup (safe)
    try {
      if ('outputColorSpace' in renderer && typeof THREE.SRGBColorSpace !== 'undefined') {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      }
    } catch (err) {
      // ignore
    }

    container.appendChild(renderer.domElement);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      10, 
      2000
    );
    // Camera Z position remains high to prevent clipping
    camera.position.set(0, 0, 400); 

    // Lights - Adjusted for metallic look
    const ambient = new THREE.AmbientLight(0xffffff, 0.3); 
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 1.2); 
    dir.position.set(100, 80, 100);
    scene.add(dir);

    const rimLight = new THREE.PointLight(0x7c3aed, 0.6, 600);
    rimLight.position.set(-120, -80, 120);
    scene.add(rimLight);
    
    // Additional rim/fill light for highlights
    const fillLight = new THREE.PointLight(0xffffff, 0.4, 400);
    fillLight.position.set(80, -100, -150);
    scene.add(fillLight);


    // Orbit group and orbits
    const orbitGroup = new THREE.Group();
    // CHANGED: Move the orbit center up the Y-axis
    orbitGroup.position.y = 80; 
    scene.add(orbitGroup);

    const orbits = [];
    // Coin/Metallic colors (Gold, Silver, Bronze, etc.)
    const coinColors = [0xffd700, 0xc0c0c0, 0xcd7f32, 0xffa500, 0x00bfff, 0x22c55e];
    
    // --- Setup for the Rupee Sign Emissive Texture (Pure White Text) ---
    const rupeeEmissiveTexture = generateRupeeTextTexture(128); 
    // -------------------------------------------------------------------

    for (let i = 0; i < 6; i++) {
      const radius = 10 + Math.random() * 4;
      const thickness = 2 + Math.random() * 1.5; 

      // Changed to CylinderGeometry for a coin shape
      const geom = new THREE.CylinderGeometry(radius, radius, thickness, 32); 
      geom.rotateX(Math.PI / 2); // Rotate to make it flat like a coin

      const color = new THREE.Color(coinColors[i % coinColors.length]);

      // Metallic material for the rim (side of the cylinder)
      const matMetal = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.9, 
        roughness: 0.2, 
        clearcoat: 0.1, 
        clearcoatRoughness: 0.2,
      });

      // Standard Material for faces with OPAQUE color and white emissive text
      const matFace = new THREE.MeshStandardMaterial({
          // Base color for the coin face (no background texture needed anymore)
          color: color.clone().multiplyScalar(0.7), 
          metalness: 0.9, 
          roughness: 0.3,
          
          // Use the text texture as an emissive map to make it glow pure white
          emissive: 0xffffff, 
          emissiveMap: rupeeEmissiveTexture,
          emissiveIntensity: 1.0, 
          
          side: THREE.FrontSide,
      });

      // Multi-material array: [Top Cap, Bottom Cap, Side]
      const materials = [matFace, matFace, matMetal];

      const mesh = new THREE.Mesh(geom, materials);
      
      // Added a subtle shadow/glow below the coin using a Sprite
      const spriteMaterial = new THREE.SpriteMaterial({
        map: generateSpriteTexture(200, color),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.3, 
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(30, 30, 1);
      // Position the sprite to be slightly behind/below the coin
      sprite.position.set(0, 0, -thickness * 2); 
      mesh.add(sprite);

      const orbitHolder = new THREE.Object3D();
      orbitHolder.add(mesh);

      orbitHolder.userData = {
        orbitRadius: 75 + i * 18 + (Math.random() - 0.5) * 18,
        speed: 0.3 + Math.random() * 0.6,
        tiltX: (Math.random() - 0.5) * 0.6,
        tiltY: (Math.random() - 0.5) * 0.6,
      };

      // Set initial position
      mesh.position.set(
        orbitHolder.userData.orbitRadius,
        0,
        (i % 2 ? 20 : -20) * (i / 6 + 0.7)
      );

      orbitGroup.add(orbitHolder);
      orbits.push({ holder: orbitHolder, mesh, sprite });
    }

    // Nebula background sprite (kept the same)
    const nebulaSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: generateSoftCircle(1024),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
      })
    );
    nebulaSprite.scale.set(900, 600, 1);
    nebulaSprite.position.set(-60, 40, -220);
    scene.add(nebulaSprite);

    // Resize handler
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);

    // Mouse parallax
    function onMove(e) {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouse.current.x = (x - 0.5) * 2;
      mouse.current.y = (y - 0.5) * -2;
    }
    container.addEventListener('pointermove', onMove);

    let mounted = true;
    const clock = new THREE.Clock();

    function animate() {
      if (!mounted) return;

      const t = clock.getElapsedTime();

      orbits.forEach((o, idx) => {
        const ud = o.holder.userData;
        const angle = t * ud.speed + idx * 0.7;

        o.holder.rotation.x = ud.tiltX;
        o.holder.rotation.y = ud.tiltY;
        o.holder.rotation.z = angle;

        // Make the coin spin on its own axis (the Y-axis of the mesh)
        o.mesh.rotation.y = t * 2.5; 
        
        o.mesh.position.z =
          Math.sin(t * ud.speed * 1.2 + idx) * 16 * (idx / 6 + 0.8);

        o.sprite.scale.setScalar(
          20 + Math.sin(t * 2 + idx) * 3 + (idx % 2) * 6
        );
      });

      // Smooth orbitGroup follow
      orbitGroup.rotation.x += (mouse.current.y * 0.25 - orbitGroup.rotation.x) * 0.08;
      orbitGroup.rotation.y += (mouse.current.x * 0.6 - orbitGroup.rotation.y) * 0.08;

      camera.position.x += (mouse.current.x * 30 - camera.position.x) * 0.05;
      camera.position.y += (mouse.current.y * 18 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      mounted = false;
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointermove', onMove);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    // ---- helpers ----
    function generateSpriteTexture(size = 200, color = new THREE.Color(0xffffff)) {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      const cx = size / 2;
      const cy = size / 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
      const hex = `#${color.getHexString()}`;
      grad.addColorStop(0, hex);
      grad.addColorStop(0.2, hex + '88');
      grad.addColorStop(0.45, hex + '33');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }

    function generateSoftCircle(size = 1024) {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      const cx = size / 2;
      const cy = size / 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 1.1);
      grad.addColorStop(0, 'rgba(168,85,247,0.9)');
      grad.addColorStop(0.25, 'rgba(56,189,248,0.5)');
      grad.addColorStop(0.6, 'rgba(15,23,42,0.15)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }

    // ---- Text-only helper for Emissive Map (guaranteed white) ----
    function generateRupeeTextTexture(size = 256) {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');
        
        // Draw the Rupee symbol in PURE WHITE
        ctx.font = `${size * 0.6}px 'Arial', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff'; 

        // Draw the Rupee symbol (₹) in the center
        ctx.fillText('₹', size / 2, size / 2 + size * 0.05); 

        const texture = new THREE.CanvasTexture(c);
        texture.needsUpdate = true;
        return texture;
    }
  }, []);

  return (
    <section className="hero-section" ref={sectionRef}>
      <div className="hero-bg-circle circle-1" />
      <div className="hero-bg-circle circle-2" />
      <div className="hero-bg-circle circle-3" />

      <div className="hero-content">
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          Powering Your <span>Financial Flows</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        >
          Connect accounts, automate payouts, and track every transaction in
          real time with a single dashboard.
        </motion.p>

        <div className="hero-center">
          <div className="three-canvas" ref={mountRef} />

          {/* floating labels with framer-motion animations */}
          <div className="floating-labels" aria-hidden>
            {floatingItems.map((item, index) => {
              // create per-label motion settings
              const baseDuration = 3.2 + index * 0.3;
              const delay = index * 0.12;

              return (
                <motion.div
                  key={item.id}
                  className={`float-label label-${index + 1}`}
                  initial={{ opacity: 0, scale: 0.9, y: 6 }}
                  animate={{
                    opacity: [0.95, 1, 0.95],
                    y: [0, -12 + (index % 2 === 0 ? -6 : 6), 0],
                    rotate: [0, (index % 2 === 0 ? 6 : -6), 0],
                    scale: [1, 1.06, 1],
                  }}
                  transition={{
                    duration: baseDuration,
                    delay,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  whileHover={{ scale: 1.12, z: 40 }}
                  style={{ transformStyle: 'preserve-3d', WebkitTransformStyle: 'preserve-3d' }}
                >
                  {item.label}
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="hero-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            style={{
              rotateX: cardRotateX,
              rotateY: cardRotateY,
              y: cardTranslateY,
              scale: cardScale,
              transformStyle: 'preserve-3d',
            }}
            whileHover={{
              rotateX: 8,
              rotateY: -8,
              scale: 1.05,
              boxShadow:
                '0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(168, 85, 247, 0.8)',
            }}
          >
            <div className="hero-card-glow" />
            <div className="hero-card-header">
              <span className="pill">LIVE</span>
              <span className="status-dot" />
            </div>
            <div className="hero-card-body">
              <p className="card-title">Total Volume</p>
              <p className="card-value">₹ 12,45,890</p>
              <div className="card-mini-stats">
                <div>
                  <span className="label">Today</span>
                  <span className="value">+18%</span>
                </div>
                <div>
                  <span className="label">Active Integrations</span>
                  <span className="value">12</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Task_2;