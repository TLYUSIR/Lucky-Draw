
export const lightenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

export const darkenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

export const createConfetti = () => {
  const colors = [
    '#c0392b', // Deep Red
    '#2ecc71', // Emerald Green
    '#e74c3c', // Alizarin Red
    '#27ae60', // Nephritis Green
    '#ffd700', // Gold
    '#ffffff', // White
    '#f1c40f', // Sun Flower Yellow
    '#e67e22', // Carrot Orange
    '#ecf0f1', // Clouds (Silver)
    '#d35400', // Pumpkin
  ];
  
  const confettiCount = 150; // Increased count for more density
  
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  container.style.perspective = '1000px'; // Enable 3D perspective
  document.body.appendChild(container);

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    const isCircle = Math.random() > 0.5;
    const size = Math.random() * 12 + 6;
    const initialRotation = Math.random() * 360;
    const drift = (Math.random() - 0.5) * 200; // Horizontal drift range
    const rotationX = Math.random() * 720;
    const rotationY = Math.random() * 720;

    confetti.style.position = 'absolute';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-20px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = size + 'px';
    confetti.style.height = (isCircle ? size : size * 0.6) + 'px';
    confetti.style.borderRadius = isCircle ? '50%' : '2px';
    confetti.style.opacity = (Math.random() * 0.5 + 0.5).toString();
    confetti.style.transform = `rotate(${initialRotation}deg)`;
    confetti.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    
    // Add dynamic 3D animation
    const animation = confetti.animate([
      { 
        transform: `translateY(0) translateX(0) rotateX(0deg) rotateY(0deg) rotateZ(${initialRotation}deg) scale(1)`, 
        opacity: 1 
      },
      { 
        transform: `translateY(100vh) translateX(${drift}px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${initialRotation + 360}deg) scale(0.5)`, 
        opacity: 0 
      }
    ], {
      duration: Math.random() * 3000 + 2000,
      delay: Math.random() * 800,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'forwards'
    });

    container.appendChild(confetti);
    animation.onfinish = () => confetti.remove();
  }

  // Cleanup container after animations are likely done
  setTimeout(() => {
    if (container.parentNode) {
      container.remove();
    }
  }, 6000);
};
