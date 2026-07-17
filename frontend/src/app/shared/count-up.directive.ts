import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/** Animates a number from 0 to its value when it scrolls into view.
 *  Keeps any suffix (like "+"). Respects prefers-reduced-motion. */
@Directive({ selector: '[appCountUp]' })
export class CountUpDirective implements OnInit, OnDestroy {
  appCountUp = input.required<string>(); // e.g. "8+", "10+", "24"

  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const element = this.el.nativeElement as HTMLElement;
    const raw = this.appCountUp();
    const match = raw.match(/^(\d+)(.*)$/);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!match || reduceMotion || !('IntersectionObserver' in window)) {
      element.textContent = raw;
      return;
    }

    const target = parseInt(match[1], 10);
    const suffix = match[2] ?? '';
    element.textContent = `0${suffix}`;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.observer?.disconnect();
        const start = performance.now();
        const duration = 1100;
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = `${Math.round(target * eased)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
