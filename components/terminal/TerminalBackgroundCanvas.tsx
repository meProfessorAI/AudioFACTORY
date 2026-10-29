import React, { useEffect, useRef } from 'react';
import { useTerminal } from './TerminalContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

export const TerminalBackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isAudioActive, activeSkin } = useTerminal();
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Initialize subtle ambient motes matching the active day skin
    const particleCount = Math.min(24, Math.floor((width * height) / 35000));
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.25 + 0.1,
      });
    }

    let wavePhase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Clean Architectural Day Grid
      const gridSize = 40;
      ctx.strokeStyle = activeSkin.palette.border;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 0.5;

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Subtle grid intersection markers in day skin accent
      const step = gridSize * 3;
      ctx.fillStyle = activeSkin.palette.accent;
      ctx.globalAlpha = 0.25;
      for (let x = step; x < width; x += step) {
        for (let y = step; y < height; y += step) {
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }

      // 2. Interactive Audio Wave Ribbon (Reacts when audio is active)
      wavePhase += isAudioActive ? 0.05 : 0.015;
      const waveAmplitude = isAudioActive ? 28 : 10;
      const waveY = height * 0.88;

      ctx.beginPath();
      ctx.strokeStyle = activeSkin.palette.accent;
      ctx.globalAlpha = isAudioActive ? 0.4 : 0.18;
      ctx.lineWidth = isAudioActive ? 2 : 1;

      for (let x = 0; x <= width; x += 10) {
        const dx = (x - mouseRef.current.x);
        const dist = Math.sqrt(dx * dx);
        const mouseLift = mouseRef.current.active && dist < 200 ? (1 - dist / 200) * 15 : 0;

        const y = waveY + Math.sin(x * 0.008 + wavePhase) * waveAmplitude + Math.cos(x * 0.02 - wavePhase * 1.5) * (waveAmplitude * 0.4) - mouseLift;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // 3. Floating Ambient Particles (Day Accent Tints)
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = activeSkin.palette.accent;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAudioActive, activeSkin]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.9 }}
    />
  );
};
