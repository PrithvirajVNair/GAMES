/**
 * author: @phoenix
 * date: 2024-06-10
 * 
 * InputBehaviorAnalyzer is a class that analyzes user input behavior to determine if the input is likely from a human or a bot/script.
 * It tracks various metrics such as keystrokes, input events, paste events, and focus events to make this determination.
 */

class InputBehaviorAnalyzer {
  constructor(inputElement) {
    this.inputElement = inputElement;

    // This object stores the behavioral footprints of the user
    this.metrics = {
      keydownCount: 0,
      trustedKeydownCount: 0,
      untrustedEventCount: 0,
      inputEventCount: 0,
      trustedInputEventCount: 0,
      timestamps: [],
      pasted: false,
      focusCount: document.activeElement === inputElement ? 1 : 0
    };

    this.bindEvents();
  }

  bindEvents() {
    // Track if the user ever actually clicked or tabbed into the field
    this.inputElement.addEventListener('focus', () => {
      this.metrics.focusCount++;
    });

    // Track physical keystrokes and timestamp them for speed analysis
    this.inputElement.addEventListener('keydown', (e) => {
      this.metrics.keydownCount++;

      if (e.isTrusted) {
        this.metrics.trustedKeydownCount++;
      } else {
        this.metrics.untrustedEventCount++;
      }

      this.metrics.timestamps.push(Date.now());
    });

    // Track when the actual value changes
    this.inputElement.addEventListener('input', (e) => {
      this.metrics.inputEventCount++;

      if (e.isTrusted) {
        this.metrics.trustedInputEventCount++;
      } else {
        this.metrics.untrustedEventCount++;
      }
    });

    // Allow humans to paste text normally, but flag if a script fakes a paste
    this.inputElement.addEventListener('paste', (e) => {
      if (e.isTrusted) {
        this.metrics.pasted = true;
      } else {
        this.metrics.untrustedEventCount++;
      }
    });
  }

  analyze() {
    const valueLength = this.inputElement.value.length;
    let isHuman = true;
    let reasons = [];

    // 1. Check for untrusted events (The most obvious sign of a script)
    if (this.metrics.untrustedEventCount > 0) {
      isHuman = false;
      reasons.push("Untrusted events detected (script injection).");
    }

    // 2. Check for missing keyboard events
    // If there is text, but no keys were pressed and nothing was pasted, it's a bot.
    if (valueLength > 0 && !this.metrics.pasted) {
      if (this.metrics.keydownCount === 0) {
        isHuman = false;
        reasons.push("Input value changed without any keystrokes or paste events.");
      }
    }

    // 3. Analyze typing cadence
    if (this.metrics.timestamps.length > 2) {
      const intervals = [];

      // Calculate the time difference between each keystroke
      for (let i = 1; i < this.metrics.timestamps.length; i++) {
        const diff = this.metrics.timestamps[i] - this.metrics.timestamps[i - 1];
        intervals.push(diff);
      }

      // Calculate average typing speed
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // If average time between keystrokes is less than 15ms, it's superhumanly fast
      if (avgInterval < 15) {
        isHuman = false;
        reasons.push(`Typing speed is impossibly fast (average ${avgInterval.toFixed(2)}ms per keystroke).`);
      }

      // Check for robotic variance (Perfect, unvarying intervals between keystrokes)
      const variance = intervals.reduce((acc, val) => acc + Math.pow(val - avgInterval, 2), 0) / intervals.length;
      if (variance < 2 && intervals.length > 3) {
        isHuman = false;
        reasons.push("Keystroke intervals have no human variance (robotic cadence).");
      }
    }

    // 4. Check for lack of focus
    // A human has to click or focus the field (or have it auto-focused) to type in it.
    const isCurrentlyFocused = document.activeElement === this.inputElement;
    if (valueLength > 0 && this.metrics.focusCount === 0 && !isCurrentlyFocused && this.metrics.keydownCount === 0 && this.metrics.inputEventCount > 0) {
      isHuman = false;
      reasons.push("Input received data without the element ever being focused.");
    }

    return {
      isHuman: isHuman,
      reasons: reasons,
      rawMetrics: this.metrics
    };
  }

  // Reset metrics (useful if the game moves to the next flag without a page refresh)
  reset() {
    this.metrics = {
      keydownCount: 0,
      trustedKeydownCount: 0,
      untrustedEventCount: 0,
      inputEventCount: 0,
      trustedInputEventCount: 0,
      timestamps: [],
      pasted: false,
      focusCount: document.activeElement === this.inputElement ? 1 : 0
    };
  }
}

export default InputBehaviorAnalyzer;