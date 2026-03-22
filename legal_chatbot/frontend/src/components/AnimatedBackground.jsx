import { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log('🎨 AnimatedBackground component mounted');
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('❌ Canvas element not found');
      return;
    }

    console.log('✅ Canvas found:', canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Could not get 2D context');
      return;
    }

    console.log('✅ 2D context obtained');

    // Set canvas size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      console.log('📐 Canvas resized to:', canvas.width, 'x', canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation variables
    let time = 0;
    const particles = [];
    const particleCount = 50;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }

    // Animation loop
    const animate = () => {
      time += 0.01;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const hue = 220 + Math.sin(time * 0.5) * 30; // Blue to purple
      
      gradient.addColorStop(0, `hsla(${hue}, 60%, 10%, 1)`);
      gradient.addColorStop(0.5, `hsla(${hue + 20}, 50%, 15%, 1)`);
      gradient.addColorStop(1, `hsla(${hue + 40}, 40%, 20%, 1)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update particles
      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.fillStyle = `rgba(150, 150, 255, ${0.3 + Math.sin(time + particle.x) * 0.2})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connecting lines
      ctx.strokeStyle = 'rgba(150, 150, 255, 0.1)';
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
    console.log('🎬 Animation started');

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas 
    ref={canvasRef} 
    className="animated-background"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      pointerEvents: 'none'
    }}
  />;
}
