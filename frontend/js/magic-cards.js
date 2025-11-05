// Magic Cards JavaScript - Visual Effects Engine
// Adds particle effects, spotlight, and interactive animations

// Configuration
const MAGIC_CONFIG = {
  particleCount: 8,
  glowColor: '132, 0, 255', // Purple RGB
  spotlightRadius: 300,
  enableParticles: true,
  enableSpotlight: true,
  enableBorderGlow: true,
  enableTilt: false,
  enableRipple: true,
  disableOnMobile: true
};

// Utility: Check if mobile
function isMobile() {
  return window.innerWidth <= 768;
}

// Utility: Check if user prefers reduced motion
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Should disable effects?
function shouldDisableEffects() {
  return (MAGIC_CONFIG.disableOnMobile && isMobile()) || prefersReducedMotion();
}

// ============================================
// Particle System
// ============================================

class ParticleSystem {
  constructor(card) {
    this.card = card;
    this.particles = [];
    this.isActive = false;
  }

  createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position within card
    const rect = this.card.getBoundingClientRect();
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    // Random animation delay
    particle.style.animationDelay = `${Math.random() * 2}s`;
    particle.style.animationDuration = `${3 + Math.random() * 2}s`;
    
    return particle;
  }

  start() {
    if (this.isActive || shouldDisableEffects()) return;
    
    this.isActive = true;
    
    // Create particles
    for (let i = 0; i < MAGIC_CONFIG.particleCount; i++) {
      setTimeout(() => {
        if (!this.isActive) return;
        
        const particle = this.createParticle();
        this.card.appendChild(particle);
        this.particles.push(particle);
        
        // Fade in
        particle.style.opacity = '0';
        setTimeout(() => {
          particle.style.transition = 'opacity 0.3s ease';
          particle.style.opacity = '1';
        }, 10);
      }, i * 100);
    }
  }

  stop() {
    this.isActive = false;
    
    // Remove all particles
    this.particles.forEach(particle => {
      particle.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      particle.style.opacity = '0';
      particle.style.transform = 'scale(0)';
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 300);
    });
    
    this.particles = [];
  }
}

// ============================================
// Global Spotlight System
// ============================================

class SpotlightSystem {
  constructor() {
    this.spotlight = null;
    this.isActive = false;
    this.targetOpacity = 0;
  }

  init() {
    if (shouldDisableEffects() || !MAGIC_CONFIG.enableSpotlight) return;
    
    // Create spotlight element
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'global-spotlight';
    this.spotlight.style.setProperty('--glow-color', MAGIC_CONFIG.glowColor);
    document.body.appendChild(this.spotlight);
    
    // Mouse move handler
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  handleMouseMove(e) {
    if (!this.spotlight) return;
    
    // Update spotlight position
    this.spotlight.style.left = `${e.clientX}px`;
    this.spotlight.style.top = `${e.clientY}px`;
    
    // Check if over any magic card
    const cards = document.querySelectorAll('.magic-card');
    let isOverCard = false;
    let minDistance = Infinity;
    
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Distance from mouse to card center
      const distance = Math.hypot(
        e.clientX - centerX,
        e.clientY - centerY
      );
      
      minDistance = Math.min(minDistance, distance);
      
      // Check if mouse is over card
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        isOverCard = true;
      }
      
      // Update card glow properties
      if (MAGIC_CONFIG.enableBorderGlow) {
        const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
        const relativeY = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Calculate intensity based on distance
        let intensity = 0;
        if (distance < MAGIC_CONFIG.spotlightRadius * 0.5) {
          intensity = 1;
        } else if (distance < MAGIC_CONFIG.spotlightRadius) {
          intensity = 1 - (distance - MAGIC_CONFIG.spotlightRadius * 0.5) / (MAGIC_CONFIG.spotlightRadius * 0.5);
        }
        
        card.style.setProperty('--glow-x', `${relativeX}%`);
        card.style.setProperty('--glow-y', `${relativeY}%`);
        card.style.setProperty('--glow-intensity', intensity.toString());
      }
    });
    
    // Show/hide spotlight based on proximity to cards
    if (minDistance < MAGIC_CONFIG.spotlightRadius) {
      const intensity = 1 - minDistance / MAGIC_CONFIG.spotlightRadius;
      this.spotlight.style.opacity = (intensity * 0.8).toString();
    } else {
      this.spotlight.style.opacity = '0';
    }
  }

  handleMouseLeave() {
    if (!this.spotlight) return;
    
    this.spotlight.style.opacity = '0';
    
    // Reset all card glows
    document.querySelectorAll('.magic-card').forEach(card => {
      card.style.setProperty('--glow-intensity', '0');
    });
  }

  destroy() {
    if (this.spotlight && this.spotlight.parentNode) {
      this.spotlight.parentNode.removeChild(this.spotlight);
    }
    this.spotlight = null;
  }
}

// ============================================
// Card Enhancement System
// ============================================

class MagicCard {
  constructor(element) {
    this.element = element;
    this.particleSystem = null;
    
    if (MAGIC_CONFIG.enableParticles) {
      this.particleSystem = new ParticleSystem(element);
    }
    
    this.init();
  }

  init() {
    if (shouldDisableEffects()) return;
    
    // Add magic card class
    this.element.classList.add('magic-card');
    
    if (MAGIC_CONFIG.enableBorderGlow) {
      this.element.classList.add('border-glow');
    }
    
    // Set CSS variables
    this.element.style.setProperty('--glow-color', MAGIC_CONFIG.glowColor);
    
    // Event listeners
    this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    
    if (MAGIC_CONFIG.enableRipple) {
      this.element.addEventListener('click', this.handleClick.bind(this));
    }
  }

  handleMouseEnter() {
    if (this.particleSystem) {
      this.particleSystem.start();
    }
  }

  handleMouseLeave() {
    if (this.particleSystem) {
      this.particleSystem.stop();
    }
    
    // Reset tilt
    if (MAGIC_CONFIG.enableTilt) {
      this.element.style.transform = '';
    }
  }

  handleMouseMove(e) {
    if (!MAGIC_CONFIG.enableTilt) return;
    
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate tilt
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    
    this.element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  handleClick(e) {
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create ripple
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    
    // Calculate max distance for full coverage
    const maxDistance = Math.max(
      Math.hypot(x, y),
      Math.hypot(x - rect.width, y),
      Math.hypot(x, y - rect.height),
      Math.hypot(x - rect.width, y - rect.height)
    );
    
    const size = maxDistance * 2;
    
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x - maxDistance}px`;
    ripple.style.top = `${y - maxDistance}px`;
    ripple.style.background = `radial-gradient(circle, rgba(${MAGIC_CONFIG.glowColor}, 0.4) 0%, rgba(${MAGIC_CONFIG.glowColor}, 0.2) 30%, transparent 70%)`;
    
    this.element.appendChild(ripple);
    
    // Remove after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 800);
  }
}

// ============================================
// Auto-initialization
// ============================================

let spotlightSystem = null;
let magicCards = [];

function initMagicCards() {
  if (shouldDisableEffects()) {
    console.log('Magic effects disabled (mobile or reduced motion preference)');
    return;
  }
  
  // Initialize spotlight
  if (!spotlightSystem) {
    spotlightSystem = new SpotlightSystem();
    spotlightSystem.init();
  }
  
  // Find all cards and enhance them
  const cardElements = document.querySelectorAll('[data-magic-card]');
  
  cardElements.forEach(element => {
    // Skip if already initialized
    if (element.classList.contains('magic-card')) return;
    
    const magicCard = new MagicCard(element);
    magicCards.push(magicCard);
  });
  
  console.log(`✨ Initialized ${magicCards.length} magic cards`);
}

// Cleanup function
function destroyMagicCards() {
  if (spotlightSystem) {
    spotlightSystem.destroy();
    spotlightSystem = null;
  }
  
  magicCards = [];
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMagicCards);
} else {
  initMagicCards();
}

// Re-initialize on window resize (debounced)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    destroyMagicCards();
    initMagicCards();
  }, 250);
});

// Export for manual initialization
window.MagicCards = {
  init: initMagicCards,
  destroy: destroyMagicCards,
  config: MAGIC_CONFIG
};