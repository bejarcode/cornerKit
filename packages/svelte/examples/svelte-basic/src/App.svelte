<script lang="ts">
  import { Squircle, squircle } from '@cornerkit/svelte';

  // Interactive controls state
  let radius = 20;
  let smoothing = 0.8;
  let borderEnabled = false;
  let borderWidth = 2;
  let borderColor = '#000000';

  // Computed border config
  $: borderConfig = borderEnabled
    ? { width: borderWidth, color: borderColor }
    : undefined;

  // Code example
  $: codeExample = `// Using the Squircle component
import { Squircle } from '@cornerkit/svelte';

<Squircle
  radius={${radius}}
  smoothing={${smoothing}}${borderEnabled ? `\n  border={{ width: ${borderWidth}, color: '${borderColor}' }}` : ''}
>
  Content goes here
</Squircle>

// Using the squircle action
import { squircle } from '@cornerkit/svelte';

<div use:squircle={{ radius: 24, smoothing: 0.9 }}>
  Content
</div>

// Action with number shorthand
<div use:squircle={20}>
  Content
</div>`;

  function handleButtonClick() {
    alert('Button clicked!');
  }
</script>

<div class="container">
  <header>
    <h1>@cornerkit/svelte Example</h1>
    <p>Svelte components and actions for iOS-style squircle corners</p>
  </header>

  <main>
    <!-- Demo Grid -->
    <section class="demo-grid">
      <!-- Basic Squircle Component -->
      <Squircle class="demo-card card-blue" radius={20} smoothing={0.8}>
        <h3>Basic Squircle</h3>
        <p>radius: 20px, smoothing: 0.8</p>
        <code>&lt;Squircle radius=&#123;20&#125; smoothing=&#123;0.8&#125;&gt;</code>
      </Squircle>

      <!-- High Smoothing -->
      <Squircle class="demo-card card-purple" radius={20} smoothing={0.95}>
        <h3>High Smoothing</h3>
        <p>radius: 20px, smoothing: 0.95</p>
        <code>&lt;Squircle radius=&#123;20&#125; smoothing=&#123;0.95&#125;&gt;</code>
      </Squircle>

      <!-- With Border -->
      <Squircle
        class="demo-card card-pink"
        radius={20}
        smoothing={0.8}
        border={{ width: 3, color: '#ffffff' }}
      >
        <h3>With Border</h3>
        <p>radius: 20px, border: 3px white</p>
        <code>&lt;Squircle border=&#123;&#123; width: 3, color: '#fff' &#125;&#125;&gt;</code>
      </Squircle>

      <!-- use:squircle Action -->
      <div use:squircle={{ radius: 24, smoothing: 0.9 }} class="demo-card card-amber">
        <h3>use:squircle Action</h3>
        <p>radius: 24px, smoothing: 0.9</p>
        <code>use:squircle=&#123;&#123; radius: 24 &#125;&#125;</code>
      </div>
    </section>

    <!-- Action Examples -->
    <section class="action-section">
      <h2>use:squircle Action</h2>
      <p class="section-description">Apply squircle corners directly with the use:squircle action</p>

      <div class="action-grid">
        <div use:squircle={{ radius: 16, smoothing: 0.8 }} class="action-card card-teal">
          <h3>Object Syntax</h3>
          <code>use:squircle=&#123;&#123; radius: 16, smoothing: 0.8 &#125;&#125;</code>
        </div>

        <div use:squircle={24} class="action-card card-indigo">
          <h3>Number Shorthand</h3>
          <code>use:squircle=&#123;24&#125;</code>
        </div>

        <div
          use:squircle={{ radius: 20, border: { width: 2, color: '#ffffff' } }}
          class="action-card card-rose"
        >
          <h3>With Border</h3>
          <code>use:squircle=&#123;&#123; radius: 20, border: &#123;...&#125; &#125;&#125;</code>
        </div>
      </div>
    </section>

    <!-- Polymorphic Examples -->
    <section class="polymorphic-section">
      <h2>Applying to Different Elements</h2>
      <p class="section-description">The action can be applied to any HTML element</p>

      <div class="polymorphic-grid">
        <button
          use:squircle={{ radius: 12, smoothing: 0.85 }}
          class="squircle-button"
          on:click={handleButtonClick}
        >
          Click Me (button)
        </button>

        <a
          href="https://github.com/bejarcode/cornerKit"
          target="_blank"
          rel="noopener noreferrer"
          use:squircle={{ radius: 12, smoothing: 0.85 }}
          class="squircle-link"
        >
          GitHub Link (a)
        </a>

        <input
          type="text"
          placeholder="Type here... (input)"
          use:squircle={{ radius: 10, smoothing: 0.8 }}
          class="squircle-input"
        />
      </div>
    </section>

    <!-- Interactive Controls -->
    <section class="controls">
      <h2>Interactive Demo</h2>

      <div class="control-panel">
        <div class="control-group">
          <label for="radius-slider">
            Radius: <span>{radius}px</span>
          </label>
          <input
            id="radius-slider"
            type="range"
            min="0"
            max="50"
            bind:value={radius}
          />
        </div>

        <div class="control-group">
          <label for="smoothing-slider">
            Smoothing: <span>{smoothing.toFixed(2)}</span>
          </label>
          <input
            id="smoothing-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            bind:value={smoothing}
          />
        </div>

        <!-- Border Controls -->
        <div class="border-controls-wrapper">
          <div class="border-toggle">
            <label for="border-toggle">Enable Border</label>
            <input
              id="border-toggle"
              type="checkbox"
              bind:checked={borderEnabled}
            />
          </div>

          {#if borderEnabled}
            <div class="border-controls">
              <div class="control-group">
                <label for="border-width-slider">
                  Border Width: <span>{borderWidth}px</span>
                </label>
                <input
                  id="border-width-slider"
                  type="range"
                  min="1"
                  max="10"
                  bind:value={borderWidth}
                />
              </div>

              <div class="control-group">
                <label for="border-color-picker">
                  Border Color: <span>{borderColor}</span>
                </label>
                <input
                  id="border-color-picker"
                  type="color"
                  bind:value={borderColor}
                />
              </div>
            </div>
          {/if}
        </div>

        <Squircle
          class="interactive-demo"
          {radius}
          {smoothing}
          border={borderConfig}
        >
          <h3>Interactive Squircle</h3>
          <p>Adjust the controls above</p>
        </Squircle>
      </div>
    </section>

    <!-- Code Example -->
    <section class="code-example">
      <h2>Usage Example</h2>
      <pre><code>{codeExample}</code></pre>
    </section>
  </main>

  <footer>
    <p>
      <a href="https://github.com/bejarcode/cornerKit" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
      |
      <a
        href="https://github.com/bejarcode/cornerKit/tree/main/packages/svelte#readme"
        target="_blank"
        rel="noopener noreferrer"
      >
        Documentation
      </a>
      |
      <a href="https://www.npmjs.com/package/@cornerkit/svelte" target="_blank" rel="noopener noreferrer">
        npm
      </a>
    </p>
  </footer>
</div>
