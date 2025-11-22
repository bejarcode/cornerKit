import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, renderHook } from '@testing-library/react';
import React from 'react';
import { useSquircle } from '../../src/useSquircle';

// Test component that uses the hook
function TestComponent({
  options,
  testId = 'squircle',
}: {
  options?: Parameters<typeof useSquircle>[0];
  testId?: string;
}) {
  const ref = useSquircle<HTMLDivElement>(options);
  return <div ref={ref} data-testid={testId}>Content</div>;
}

describe('useSquircle Hook', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Ref Return', () => {
    it('returns a ref object', () => {
      const { result } = renderHook(() => useSquircle());
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('current');
    });

    it('ref is initially null', () => {
      const { result } = renderHook(() => useSquircle());
      expect(result.current.current).toBeNull();
    });

    it('ref points to DOM element after attachment', () => {
      render(<TestComponent options={{ radius: 20 }} />);
      const element = screen.getByTestId('squircle');
      expect(element).toBeTruthy();
    });
  });

  describe('Squircle Application', () => {
    it('applies squircle when ref attaches', async () => {
      render(<TestComponent options={{ radius: 20 }} />);
      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });

    it('applies squircle with custom radius', async () => {
      render(<TestComponent options={{ radius: 40 }} />);
      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });

    it('applies squircle with smoothing option', async () => {
      render(<TestComponent options={{ radius: 20, smoothing: 0.9 }} />);
      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });

    it('applies squircle with border option', async () => {
      render(
        <TestComponent
          options={{
            radius: 20,
            border: { width: 2, color: '#3b82f6' },
          }}
        />
      );
      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });
  });

  describe('Options Updates', () => {
    it('updates squircle when radius changes', async () => {
      const { rerender } = render(
        <TestComponent options={{ radius: 20 }} />
      );
      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });

      rerender(<TestComponent options={{ radius: 40 }} />);

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });

    it('updates squircle when smoothing changes', async () => {
      const { rerender } = render(
        <TestComponent options={{ radius: 20, smoothing: 0.5 }} />
      );
      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });

      rerender(<TestComponent options={{ radius: 20, smoothing: 0.9 }} />);

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });

    it('updates squircle when border changes', async () => {
      const { rerender } = render(
        <TestComponent
          options={{
            radius: 20,
            border: { width: 1, color: 'gray' },
          }}
        />
      );
      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });

      rerender(
        <TestComponent
          options={{
            radius: 20,
            border: { width: 2, color: 'blue' },
          }}
        />
      );

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });
  });

  describe('Cleanup on Unmount', () => {
    it('removes squircle on unmount', async () => {
      const { unmount } = render(
        <TestComponent options={{ radius: 20 }} />
      );
      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });

      unmount();

      // After unmount, clip-path should be removed
      expect(element.style.clipPath).toBe('');
    });
  });

  describe('Null Ref Handling', () => {
    it('handles null ref gracefully', () => {
      // Hook should not throw when ref is not attached
      expect(() => {
        renderHook(() => useSquircle({ radius: 20 }));
      }).not.toThrow();
    });

    it('does not throw when element conditionally mounts', () => {
      // Test that the hook doesn't throw when element mounts conditionally
      function ConditionalMount({ show }: { show: boolean }) {
        const ref = useSquircle<HTMLDivElement>({ radius: 20 });

        // The hook creates a ref regardless of whether it's attached
        return show ? <div ref={ref} data-testid="delayed">Content</div> : null;
      }

      // Render without showing element - should not throw
      const { rerender } = render(<ConditionalMount show={false} />);
      expect(screen.queryByTestId('delayed')).toBeNull();

      // Show the element - should not throw
      rerender(<ConditionalMount show={true} />);
      expect(screen.getByTestId('delayed')).toBeTruthy();

      // Hide the element again - cleanup should work without errors
      rerender(<ConditionalMount show={false} />);
      expect(screen.queryByTestId('delayed')).toBeNull();
    });
  });

  describe('Multiple Instances', () => {
    it('multiple useSquircle calls work independently', async () => {
      function MultipleSquircles() {
        const ref1 = useSquircle<HTMLDivElement>({ radius: 20 });
        const ref2 = useSquircle<HTMLDivElement>({ radius: 40 });

        return (
          <>
            <div ref={ref1} data-testid="squircle1">First</div>
            <div ref={ref2} data-testid="squircle2">Second</div>
          </>
        );
      }

      render(<MultipleSquircles />);

      const element1 = screen.getByTestId('squircle1');
      const element2 = screen.getByTestId('squircle2');

      // Both elements should exist and be independent
      expect(element1).toBeTruthy();
      expect(element2).toBeTruthy();

      // Wait for at least one to have clip-path applied
      await vi.waitFor(() => {
        const hasClipPath1 = element1.style.clipPath !== '';
        const hasClipPath2 = element2.style.clipPath !== '';
        expect(hasClipPath1 || hasClipPath2).toBe(true);
      });
    });

    it('unmounting one does not affect others', async () => {
      function Parent({ showSecond = true }: { showSecond?: boolean }) {
        const ref1 = useSquircle<HTMLDivElement>({ radius: 20 });
        const ref2 = useSquircle<HTMLDivElement>({ radius: 40 });

        return (
          <>
            <div ref={ref1} data-testid="squircle1">First</div>
            {showSecond && <div ref={ref2} data-testid="squircle2">Second</div>}
          </>
        );
      }

      const { rerender } = render(<Parent showSecond={true} />);

      // Wait for first element to have clip-path
      await vi.waitFor(() => {
        expect(screen.getByTestId('squircle1').style.clipPath).toBeTruthy();
      });

      // Remove second squircle
      rerender(<Parent showSecond={false} />);

      // First should still have clip-path after second is removed
      expect(screen.getByTestId('squircle1').style.clipPath).toBeTruthy();
      expect(screen.queryByTestId('squircle2')).toBeNull();
    });
  });

  describe('Default Options', () => {
    it('works without any options', async () => {
      render(<TestComponent />);
      const element = screen.getByTestId('squircle');

      // Should not throw and element should exist
      expect(element).toBeTruthy();
    });

    it('uses default radius when not specified', async () => {
      render(<TestComponent />);
      const element = screen.getByTestId('squircle');

      await vi.waitFor(() => {
        expect(element.style.clipPath).toBeTruthy();
      });
    });
  });

  describe('Generic Type Parameter', () => {
    it('accepts different element types', () => {
      function TypedComponent() {
        const divRef = useSquircle<HTMLDivElement>({ radius: 20 });
        const buttonRef = useSquircle<HTMLButtonElement>({ radius: 16 });

        return (
          <>
            <div ref={divRef} data-testid="div">Div</div>
            <button type="button" ref={buttonRef} data-testid="button">Button</button>
          </>
        );
      }

      render(<TypedComponent />);

      expect(screen.getByTestId('div').tagName).toBe('DIV');
      expect(screen.getByTestId('button').tagName).toBe('BUTTON');
    });
  });
});
