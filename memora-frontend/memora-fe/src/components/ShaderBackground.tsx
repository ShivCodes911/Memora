import { useEffect, useRef } from "react";

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Fluid mesh orbs
    const orbs = [
      { x: width * 0.2, y: height * 0.3, vx: 0.4, vy: 0.3, r: 350, color: "rgba(99, 102, 241, " }, // Indigo
      { x: width * 0.8, y: height * 0.7, vx: -0.3, vy: -0.4, r: 400, color: "rgba(236, 72, 153, " }, // Pink/Rose
      { x: width * 0.5, y: height * 0.5, vx: 0.2, vy: -0.3, r: 380, color: "rgba(249, 115, 22, " }, // Orange
      { x: width * 0.3, y: height * 0.8, vx: -0.4, vy: 0.2, r: 320, color: "rgba(168, 85, 247, " }, // Purple
    ];

    let t = 0;

    const render = () => {
      t += 0.008;

      ctx.fillStyle = "#0c0a09"; // Deep dark background
      ctx.fillRect(0, 0, width, height);

      // Render morphing shader gradient orbs
      orbs.forEach((orb, i) => {
        orb.x += orb.vx + Math.sin(t + i) * 0.5;
        orb.y += orb.vy + Math.cos(t + i * 1.5) * 0.5;

        // Bounce bounds
        if (orb.x < -100 || orb.x > width + 100) orb.vx *= -1;
        if (orb.y < -100 || orb.y > height + 100) orb.vy *= -1;

        const alpha = 0.22 + Math.sin(t * 1.2 + i) * 0.05;
        const grad = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.r
        );
        grad.addColorStop(0, orb.color + alpha + ")");
        grad.addColorStop(0.5, orb.color + alpha * 0.4 + ")");
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle noise / grid dots overlay for shader texture feel
      ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
      for (let x = 0; x < width; x += 40) {
        for (let y = 0; y < height; y += 40) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90 transition-opacity duration-1000"
    />
  );
}
