// Initialize CornerKit
const ck = new window.CornerKit();

// Apply squircles to demo cards
ck.apply('#basic-card', { radius: 20, smoothing: 0.8 });
ck.apply('#smooth-card', { radius: 20, smoothing: 0.95 });
ck.apply('#sharp-card', { radius: 20, smoothing: 0.6 });
ck.apply('#large-card', { radius: 40, smoothing: 0.8 });

// Apply squircle to interactive demo card
ck.apply('#interactive-card', { radius: 20, smoothing: 0.8 });

// Set up interactive controls
const radiusSlider = document.getElementById('radius-slider');
const smoothingSlider = document.getElementById('smoothing-slider');
const radiusValue = document.getElementById('radius-value');
const smoothingValue = document.getElementById('smoothing-value');
const interactiveCard = document.getElementById('interactive-card');

// Update radius
radiusSlider.addEventListener('input', (e) => {
  const radius = parseInt(e.target.value, 10);
  radiusValue.textContent = radius;

  const smoothing = parseFloat(smoothingSlider.value);
  ck.update('#interactive-card', { radius, smoothing });
});

// Update smoothing
smoothingSlider.addEventListener('input', (e) => {
  const smoothing = parseFloat(e.target.value);
  smoothingValue.textContent = smoothing.toFixed(2);

  const radius = parseInt(radiusSlider.value, 10);
  ck.update('#interactive-card', { radius, smoothing });
});

// Log info to console
console.log('CornerKit initialized!');
console.log('Inspect any element:', ck.inspect('#basic-card'));

// Add keyboard shortcuts for fun
document.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') {
    // Reset to defaults
    radiusSlider.value = 20;
    smoothingSlider.value = 0.8;
    radiusValue.textContent = '20';
    smoothingValue.textContent = '0.80';
    ck.update('#interactive-card', { radius: 20, smoothing: 0.8 });
    console.log('Reset to defaults');
  }

  if (e.key === 'i' || e.key === 'I') {
    // Inspect interactive card
    const info = ck.inspect('#interactive-card');
    console.log('Interactive card info:', info);
  }
});

// Log keyboard shortcuts
console.log('Keyboard shortcuts:');
console.log('  R - Reset to defaults');
console.log('  I - Inspect interactive card');
