import { useState } from 'react';
import { Squircle, useSquircle } from '@cornerkit/react';

function App() {
  const [radius, setRadius] = useState(20);
  const [smoothing, setSmoothing] = useState(0.8);
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState('#000000');

  // useSquircle hook example
  const hookRef = useSquircle<HTMLDivElement>({
    radius: 24,
    smoothing: 0.9,
  });

  return (
    <div className="container">
      <header>
        <h1>@cornerkit/react Example</h1>
        <p>React components and hooks for iOS-style squircle corners</p>
      </header>

      <main>
        {/* Demo Grid */}
        <section className="demo-grid">
          {/* Basic Squircle Component */}
          <Squircle className="demo-card card-blue" radius={20} smoothing={0.8}>
            <h3>Basic Squircle</h3>
            <p>radius: 20px, smoothing: 0.8</p>
            <code>{'<Squircle radius={20} smoothing={0.8}>'}</code>
          </Squircle>

          {/* High Smoothing */}
          <Squircle className="demo-card card-purple" radius={20} smoothing={0.95}>
            <h3>High Smoothing</h3>
            <p>radius: 20px, smoothing: 0.95</p>
            <code>{'<Squircle radius={20} smoothing={0.95}>'}</code>
          </Squircle>

          {/* With Border */}
          <Squircle
            className="demo-card card-pink"
            radius={20}
            smoothing={0.8}
            border={{ width: 3, color: '#ffffff' }}
          >
            <h3>With Border</h3>
            <p>radius: 20px, border: 3px white</p>
            <code>{'<Squircle border={{ width: 3, color: "#fff" }}>'}</code>
          </Squircle>

          {/* useSquircle Hook */}
          <div ref={hookRef} className="demo-card card-amber">
            <h3>useSquircle Hook</h3>
            <p>radius: 24px, smoothing: 0.9</p>
            <code>{'const ref = useSquircle({ radius: 24 })'}</code>
          </div>
        </section>

        {/* Polymorphic Examples */}
        <section className="polymorphic-section">
          <h2>Polymorphic Component</h2>
          <p className="section-description">The Squircle component supports any HTML element via the `as` prop</p>

          <div className="polymorphic-grid">
            <Squircle
              as="button"
              className="squircle-button"
              radius={12}
              smoothing={0.85}
              onClick={() => alert('Button clicked!')}
            >
              Click Me (button)
            </Squircle>

            <Squircle
              as="a"
              href="https://github.com/bejarcode/cornerKit"
              target="_blank"
              rel="noopener noreferrer"
              className="squircle-link"
              radius={12}
              smoothing={0.85}
            >
              GitHub Link (a)
            </Squircle>

            <Squircle
              as="input"
              type="text"
              placeholder="Type here... (input)"
              className="squircle-input"
              radius={10}
              smoothing={0.8}
            />
          </div>
        </section>

        {/* Interactive Controls */}
        <section className="controls">
          <h2>Interactive Demo</h2>

          <div className="control-panel">
            <div className="control-group">
              <label htmlFor="radius-slider">
                Radius: <span>{radius}px</span>
              </label>
              <input
                id="radius-slider"
                type="range"
                min="0"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label htmlFor="smoothing-slider">
                Smoothing: <span>{smoothing.toFixed(2)}</span>
              </label>
              <input
                id="smoothing-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={smoothing}
                onChange={(e) => setSmoothing(Number(e.target.value))}
              />
            </div>

            {/* Border Controls */}
            <div className="border-controls-wrapper">
              <div className="border-toggle">
                <label htmlFor="border-toggle">Enable Border</label>
                <input
                  id="border-toggle"
                  type="checkbox"
                  checked={borderEnabled}
                  onChange={(e) => setBorderEnabled(e.target.checked)}
                />
              </div>

              {borderEnabled && (
                <div className="border-controls">
                  <div className="control-group">
                    <label htmlFor="border-width-slider">
                      Border Width: <span>{borderWidth}px</span>
                    </label>
                    <input
                      id="border-width-slider"
                      type="range"
                      min="1"
                      max="10"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(Number(e.target.value))}
                    />
                  </div>

                  <div className="control-group">
                    <label htmlFor="border-color-picker">
                      Border Color: <span>{borderColor}</span>
                    </label>
                    <input
                      id="border-color-picker"
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Squircle
              className="interactive-demo"
              radius={radius}
              smoothing={smoothing}
              border={borderEnabled ? { width: borderWidth, color: borderColor } : undefined}
            >
              <h3>Interactive Squircle</h3>
              <p>Adjust the controls above</p>
            </Squircle>
          </div>
        </section>

        {/* Code Example */}
        <section className="code-example">
          <h2>Usage Example</h2>
          <pre>
            <code>{`// Using the Squircle component
import { Squircle } from '@cornerkit/react';

function MyComponent() {
  return (
    <Squircle
      radius={${radius}}
      smoothing={${smoothing}}${borderEnabled ? `
      border={{ width: ${borderWidth}, color: '${borderColor}' }}` : ''}
    >
      Content goes here
    </Squircle>
  );
}

// Using the useSquircle hook
import { useSquircle } from '@cornerkit/react';

function MyOtherComponent() {
  const squircleRef = useSquircle<HTMLDivElement>({
    radius: 24,
    smoothing: 0.9,
  });

  return <div ref={squircleRef}>Content</div>;
}`}</code>
          </pre>
        </section>
      </main>

      <footer>
        <p>
          <a href="https://github.com/bejarcode/cornerKit" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{' '}
          |{' '}
          <a
            href="https://github.com/bejarcode/cornerKit/tree/main/packages/react#readme"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>{' '}
          |{' '}
          <a href="https://www.npmjs.com/package/@cornerkit/react" target="_blank" rel="noopener noreferrer">
            npm
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
