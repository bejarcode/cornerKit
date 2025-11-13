# Interactive Demo Website - CornerKit

This is the live demo website for cornerKit, showcasing iOS-style squircle corners for the web.

**Live Site**: https://bejarcode.github.io/cornerkit/

## Quick Start (Local Development)

### Prerequisites
- Node.js 16+ (for running local HTTP server)
- Modern browser (Chrome 65+, Firefox 60+, Safari 13.1+, Edge 79+)

### Run Locally

```bash
# Navigate to website directory
cd website

# Start local HTTP server
npx http-server -p 8080

# Open in browser
# Visit http://localhost:8080
```

### Alternative: VS Code Live Server

1. Open `index.html` in VS Code
2. Right-click → "Open with Live Server"
3. Browser opens automatically with auto-reload

## Development Workflow

This is a **vanilla HTML/CSS/JS site** with **no build step**.

1. **Edit files** (index.html, styles.css, app.js)
2. **Save** (Cmd+S / Ctrl+S)
3. **Refresh browser** (Cmd+R / Ctrl+R)

Changes are instant - no compilation, no bundling!

## Project Structure

```
website/
├── index.html          # Main HTML file
├── styles.css          # Responsive styles
├── app.js              # Interactive behavior
├── assets/             # Static assets
│   ├── logo.svg
│   ├── favicon.ico
│   └── og-image.png
└── README.md           # This file
```

## Features

- **Live Interactive Playground**: Adjust radius/smoothing sliders, see real-time updates
- **Visual Examples Gallery**: 15+ UI components with squircles (buttons, cards, modals, etc.)
- **Side-by-Side Comparison**: Squircles vs border-radius
- **Browser Compatibility Info**: Automatic tier detection (Native/Houdini/ClipPath/Fallback)
- **Code Examples**: Ready-to-use snippets in 5 formats (vanilla JS, HTML, TypeScript, React, Vue)
- **Copy-to-Clipboard**: One-click code copying
- **Keyboard Shortcuts**:
  - `R` - Reset playground to defaults
  - `I` - Inspect playground element (logs to console)

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch.

**GitHub Actions Workflow**: `.github/workflows/deploy-demo.yml`

## Tech Stack

- **HTML5**: Semantic structure
- **CSS3**: Custom properties, mobile-first responsive design
- **Vanilla JavaScript ES2020**: Zero dependencies (except cornerKit)
- **CornerKit**: Loaded from npm CDN (jsdelivr with unpkg fallback)

## Performance

- **Bundle Size**: <100KB combined (HTML + CSS + JS)
- **Load Time**: <2 seconds on 3G connection
- **Lighthouse Score**: >90 for Performance, Accessibility, Best Practices, SEO

## Accessibility

- **WCAG 2.1 AA compliant**
- **Keyboard navigation**: All interactive elements accessible via Tab/Enter/Arrow keys
- **Screen reader compatible**: Proper ARIA labels and semantic HTML
- **Color contrast**: Minimum 4.5:1 ratio
- **Reduced motion support**: Respects `prefers-reduced-motion` setting

## Browser Support

- Chrome 65+ (Houdini/ClipPath tier)
- Firefox 60+ (ClipPath tier)
- Safari 13.1+ (ClipPath tier)
- Edge 79+ (Houdini/ClipPath tier)
- IE11 (Fallback tier - border-radius only)

**Coverage**: 97.8% of global users

## Links

- **npm Package**: https://www.npmjs.com/package/@cornerkit/core
- **GitHub Repository**: https://github.com/bejarcode/cornerkit
- **Documentation**: [packages/core/README.md](../packages/core/README.md)

## License

MIT License - See [LICENSE](../LICENSE) file
