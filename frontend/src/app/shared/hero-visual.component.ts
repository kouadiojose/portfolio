import { Component } from '@angular/core';

/** Decorative terminal window shown in the hero — pure HTML/CSS, no assets. */
@Component({
  selector: 'app-hero-visual',
  preserveWhitespaces: true,
  template: `
    <div class="hero-visual" aria-hidden="true">
      <div class="code-window">
        <div class="code-window-bar">
          <i></i><i></i><i></i>
          <span>deploy — production</span>
        </div>
        <div class="code-window-body"><span class="c-prompt">$</span> <span class="c-cmd">docker compose up -d --build</span>
<span class="c-dim">[+] Building api, web…</span>
<span class="c-ok">✔</span> <span class="c-dim">postgres</span>      <span class="c-ok">healthy</span>
<span class="c-ok">✔</span> <span class="c-dim">fastapi</span>       <span class="c-ok">running</span>  <span class="c-dim">:8000</span>
<span class="c-ok">✔</span> <span class="c-dim">angular</span>       <span class="c-ok">running</span>  <span class="c-dim">:443</span>

<span class="c-prompt">$</span> <span class="c-cmd">curl /api/health</span>
&#123; <span class="c-key">"status"</span>: <span class="c-str">"ok"</span>, <span class="c-key">"auth"</span>: <span class="c-str">"keycloak"</span> &#125;</div>
      </div>

      <span class="hero-chip chip-a">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z"/></svg>
        OAuth2 · Keycloak · JWT
      </span>
      <span class="hero-chip chip-b">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/></svg>
        PostgreSQL · REST APIs
      </span>
    </div>
  `,
})
export class HeroVisualComponent {}
