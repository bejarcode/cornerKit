import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React, { createRef } from 'react';
import { Squircle } from '../../src/Squircle';

describe('Squircle Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(<Squircle>Test Content</Squircle>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders as div by default', () => {
      render(<Squircle data-testid="squircle">Content</Squircle>);
      const element = screen.getByTestId('squircle');
      expect(element.tagName).toBe('DIV');
    });

    it('renders with custom className', () => {
      render(<Squircle className="custom-class">Content</Squircle>);
      expect(screen.getByText('Content')).toHaveClass('custom-class');
    });

    it('renders with style prop', () => {
      render(
        <Squircle style={{ backgroundColor: 'red' }}>Content</Squircle>
      );
      expect(screen.getByText('Content')).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  describe('Clip-path Application', () => {
    it('applies clip-path on mount', async () => {
      render(
        <Squircle radius={20} data-testid="squircle">
          Content
        </Squircle>
      );

      const element = screen.getByTestId('squircle');

      // Wait for async CornerKit initialization
      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });

    it('applies clip-path with custom radius', async () => {
      render(
        <Squircle radius={40} data-testid="squircle">
          Content
        </Squircle>
      );

      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });

    it('applies clip-path with smoothing', async () => {
      render(
        <Squircle radius={20} smoothing={0.9} data-testid="squircle">
          Content
        </Squircle>
      );

      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });
  });

  describe('Props Update Handling', () => {
    it('updates clip-path when radius changes', async () => {
      const { rerender } = render(
        <Squircle radius={20} data-testid="squircle">
          Content
        </Squircle>
      );

      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });

      // Update radius
      rerender(
        <Squircle radius={40} data-testid="squircle">
          Content
        </Squircle>
      );

      // Should still have clip-path after update
      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });

    it('updates clip-path when smoothing changes', async () => {
      const { rerender } = render(
        <Squircle radius={20} smoothing={0.5} data-testid="squircle">
          Content
        </Squircle>
      );

      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });

      rerender(
        <Squircle radius={20} smoothing={0.9} data-testid="squircle">
          Content
        </Squircle>
      );

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });
  });

  describe('Cleanup on Unmount', () => {
    it('removes clip-path on unmount', async () => {
      const { unmount } = render(
        <Squircle radius={20} data-testid="squircle">
          Content
        </Squircle>
      );

      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });

      unmount();

      // After unmount, the clip-path should be removed
      expect(element.style.clipPath).toBe('');
    });
  });

  describe('Polymorphic "as" Prop', () => {
    it('renders as button when as="button"', () => {
      render(
        <Squircle as="button" data-testid="squircle">
          Button Content
        </Squircle>
      );

      const element = screen.getByTestId('squircle');
      expect(element.tagName).toBe('BUTTON');
    });

    it('renders as span when as="span"', () => {
      render(
        <Squircle as="span" data-testid="squircle">
          Span Content
        </Squircle>
      );

      const element = screen.getByTestId('squircle');
      expect(element.tagName).toBe('SPAN');
    });

    it('renders as input when as="input"', () => {
      render(
        <Squircle as="input" type="text" data-testid="squircle" />
      );

      const element = screen.getByTestId('squircle');
      expect(element.tagName).toBe('INPUT');
      expect(element).toHaveAttribute('type', 'text');
    });

    it('renders as section when as="section"', () => {
      render(
        <Squircle as="section" data-testid="squircle">
          Section Content
        </Squircle>
      );

      const element = screen.getByTestId('squircle');
      expect(element.tagName).toBe('SECTION');
    });

    it('passes element-specific props correctly', () => {
      const handleClick = vi.fn();

      render(
        <Squircle as="button" onClick={handleClick} data-testid="squircle">
          Click me
        </Squircle>
      );

      const button = screen.getByTestId('squircle');
      button.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('forwardRef Support', () => {
    it('forwards ref to the DOM element', () => {
      const ref = createRef<HTMLDivElement>();

      render(
        <Squircle ref={ref} data-testid="squircle">
          Content
        </Squircle>
      );

      expect(ref.current).toBeTruthy();
      expect(ref.current?.tagName).toBe('DIV');
    });

    it('forwards ref to button when as="button"', () => {
      const ref = createRef<HTMLButtonElement>();

      render(
        <Squircle as="button" ref={ref} data-testid="squircle">
          Button
        </Squircle>
      );

      expect(ref.current).toBeTruthy();
      expect(ref.current?.tagName).toBe('BUTTON');
    });

    it('calls callback ref correctly', () => {
      const callbackRef = vi.fn();

      render(
        <Squircle ref={callbackRef} data-testid="squircle">
          Content
        </Squircle>
      );

      expect(callbackRef).toHaveBeenCalled();
      expect(callbackRef.mock.calls[0][0]).toBeTruthy();
    });
  });

  describe('Border Configuration', () => {
    it('applies border configuration', async () => {
      render(
        <Squircle
          radius={20}
          border={{ width: 2, color: '#3b82f6' }}
          data-testid="squircle"
        >
          Content
        </Squircle>
      );

      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });
  });

  describe('SSR Compatibility', () => {
    it('renders without error when window is defined', () => {
      // This test runs in jsdom where window is defined
      expect(() => {
        render(<Squircle>SSR Content</Squircle>);
      }).not.toThrow();
    });
  });

  describe('Form Element Integration', () => {
    it('renders as input with placeholder', () => {
      render(
        <Squircle
          as="input"
          type="text"
          placeholder="Enter text..."
          data-testid="squircle"
        />
      );

      const input = screen.getByTestId('squircle') as HTMLInputElement;
      expect(input.tagName).toBe('INPUT');
      expect(input.placeholder).toBe('Enter text...');
    });

    it('preserves input value', () => {
      render(
        <Squircle
          as="input"
          type="text"
          defaultValue="test value"
          data-testid="squircle"
        />
      );

      const input = screen.getByTestId('squircle') as HTMLInputElement;
      expect(input.value).toBe('test value');
    });

    it('renders as textarea', () => {
      render(
        <Squircle
          as="textarea"
          rows={4}
          defaultValue="Textarea content"
          data-testid="squircle"
        />
      );

      const element = screen.getByTestId('squircle') as HTMLTextAreaElement;
      expect(element.tagName).toBe('TEXTAREA');
      expect(element.value).toBe('Textarea content');
    });
  });
});
