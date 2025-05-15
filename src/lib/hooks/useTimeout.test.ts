import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimeout } from "./useTimeout";

describe("useTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("wywołuje callback po określonym czasie", () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    act(() => {
      // Uruchom timer
      result.current.startTimer();
    });

    expect(callback).not.toHaveBeenCalled();

    // Przewiń czas
    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("czyści timeout, gdy wywołano clearTimer", () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    act(() => {
      // Uruchom timer
      result.current.startTimer();
      // Natychmiast go wyczyść
      result.current.clearTimer();
    });

    // Przewiń czas
    act(() => {
      vi.advanceTimersByTime(delay);
    });

    // Callback nie powinien być wywołany, ponieważ wyczyściliśmy timer
    expect(callback).not.toHaveBeenCalled();
  });

  it("restartuje timer, gdy startTimer jest wywoływany wielokrotnie", () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    act(() => {
      // Uruchom timer
      result.current.startTimer();
    });

    // Przewiń czas, ale niewystarczająco, by wywołać callback
    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      // Zrestartuj timer
      result.current.startTimer();
    });

    // Przewiń czas do momentu, w którym pierwszy timer powinien był się uruchomić
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Callback nie powinien zostać jeszcze wywołany, ponieważ zrestartowaliśmy timer
    expect(callback).not.toHaveBeenCalled();

    // Przewiń czas, aby zakończyć drugi timer
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Teraz callback powinien zostać wywołany
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("czyści timeout przy odmontowaniu komponentu", () => {
    const callback = vi.fn();
    const delay = 1000;

    const { unmount } = renderHook(() => useTimeout(callback, delay));

    unmount();

    // Przewiń czas
    vi.advanceTimersByTime(delay);

    // Callback nie powinien być wywołany po odmontowaniu
    expect(callback).not.toHaveBeenCalled();
  });
});
