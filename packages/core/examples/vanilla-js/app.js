// Initialize CornerKit
const ck = new window.CornerKit.default();

// Apply squircles to demo cards
ck.apply('#basic-card', { radius: 20, smoothing: 0.8 });
ck.apply('#smooth-card', { radius: 20, smoothing: 0.95 });
ck.apply('#border-card', { radius: 20, smoothing: 0.8, borderWidth: 3, borderColor: '#ffffff' });
ck.apply('#large-card', { radius: 40, smoothing: 0.8 });

// Apply squircle to interactive demo card
ck.apply('#interactive-card', { radius: 20, smoothing: 0.8 });

// Set up interactive controls
const radiusSlider = document.getElementById('radius-slider');
const smoothingSlider = document.getElementById('smoothing-slider');
const radiusValue = document.getElementById('radius-value');
const smoothingValue = document.getElementById('smoothing-value');

// Border controls
const borderToggle = document.getElementById('border-toggle');
const borderControls = document.getElementById('border-controls');
const borderWidthSlider = document.getElementById('border-width-slider');
const borderWidthValue = document.getElementById('border-width-value');
const borderColorPicker = document.getElementById('border-color-picker');
const borderColorValue = document.getElementById('border-color-value');

// Get current config for updates
function getCurrentConfig() {
  const radius = parseInt(radiusSlider.value, 10);
  const smoothing = parseFloat(smoothingSlider.value);
  const config = { radius, smoothing };

  if (borderToggle.checked) {
    config.borderWidth = parseInt(borderWidthSlider.value, 10);
    config.borderColor = borderColorPicker.value;
  }

  return config;
}

// Update interactive card
function updateInteractiveCard() {
  const config = getCurrentConfig();
  ck.update('#interactive-card', config);
}

// Update radius
radiusSlider.addEventListener('input', (e) => {
  radiusValue.textContent = e.target.value;
  updateInteractiveCard();
});

// Update smoothing
smoothingSlider.addEventListener('input', (e) => {
  smoothingValue.textContent = parseFloat(e.target.value).toFixed(2);
  updateInteractiveCard();
});

// Border toggle
borderToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    borderControls.classList.remove('hidden');
  } else {
    borderControls.classList.add('hidden');
  }
  updateInteractiveCard();
});

// Border width
borderWidthSlider.addEventListener('input', (e) => {
  borderWidthValue.textContent = e.target.value;
  updateInteractiveCard();
});

// Border color
borderColorPicker.addEventListener('input', (e) => {
  borderColorValue.textContent = e.target.value;
  updateInteractiveCard();
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
