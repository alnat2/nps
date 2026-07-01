const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

const PARTICLE_COUNT = 250;

const particles = [];
let CENTER_X, CENTER_Y, MAX_RADIUS;

function resizeCanvas() {
    if (!canvas.parentElement) return;
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    CENTER_X = canvas.width / 2;
    CENTER_Y = canvas.height / 2;
    // Радиус, на котором частицы полностью исчезают
    MAX_RADIUS = Math.min(CENTER_X, CENTER_Y) * 1.1; 
}

// Initial resize
resizeCanvas();

window.addEventListener('resize', () => {
    resizeCanvas();
});

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    const angle = Math.random() * Math.PI * 2;
    // Распределяем новые частицы ближе к центру
    const radius = Math.sqrt(Math.random()) * MAX_RADIUS * 0.7;
    
    this.x = CENTER_X + Math.cos(angle) * radius;
    this.y = CENTER_Y + Math.sin(angle) * radius;
    
    // Мягкое случайное движение
    const speed = 0.1 + Math.random() * 0.3;
    const direction = Math.random() * Math.PI * 2;
    this.vx = Math.cos(direction) * speed;
    this.vy = Math.sin(direction) * speed;
    
    // Размер частиц
    this.size = 1 + Math.random() * 2.5;
    
    // Пульсация прозрачности
    this.baseAlpha = 0.1 + Math.random() * 0.5;
    this.pulseSpeed = 0.01 + Math.random() * 0.02;
    this.angle = Math.random() * Math.PI * 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.pulseSpeed;
    
    const dx = this.x - CENTER_X;
    const dy = this.y - CENTER_Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Если частица улетает за границу "мягкого" круга, перерождаем её
    if (distance > MAX_RADIUS) {
        this.reset();
    }
  }

  draw() {
    const dx = this.x - CENTER_X;
    const dy = this.y - CENTER_Y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Плавное затухание от середины к краю
    const fadeStart = MAX_RADIUS * 0.4;
    let distanceFade = 1;
    if (distance > fadeStart) {
        distanceFade = 1 - (distance - fadeStart) / (MAX_RADIUS - fadeStart);
    }
    
    let currentAlpha = this.baseAlpha + Math.sin(this.angle) * 0.2;
    // Итоговая прозрачность с учетом отдаления от центра
    const alpha = Math.max(0, Math.min(1, currentAlpha * distanceFade));
    
    if (alpha > 0) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 249, 246, ${alpha})`;
      ctx.fill();
    }
  }
}

// Initialize particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw particles
  for (const particle of particles) {
    particle.update();
    particle.draw();
  }
  
  requestAnimationFrame(animate);
}

// Start animation loop
animate();
