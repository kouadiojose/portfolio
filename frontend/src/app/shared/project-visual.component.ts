import { Component, input } from '@angular/core';

/** Small decorative illustration per project type — inline SVG, no images.
 *  Kinds: payments · monitoring · security · integration · drone */
@Component({
  selector: 'app-project-visual',
  template: `
    <div class="project-visual" aria-hidden="true">
      @switch (kind()) {
        @case ('monitoring') {
          <svg viewBox="0 0 320 160" fill="none">
            <defs>
              <linearGradient id="pv-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#6d9dff"/><stop offset="1" stop-color="#9d7bff"/>
              </linearGradient>
            </defs>
            <g stroke="rgba(148,163,184,0.25)"><line x1="20" y1="130" x2="300" y2="130"/><line x1="20" y1="90" x2="300" y2="90"/><line x1="20" y1="50" x2="300" y2="50"/></g>
            <rect x="40" y="86" width="22" height="44" rx="4" fill="url(#pv-g)" opacity="0.55"/>
            <rect x="80" y="64" width="22" height="66" rx="4" fill="url(#pv-g)" opacity="0.75"/>
            <rect x="120" y="98" width="22" height="32" rx="4" fill="url(#pv-g)" opacity="0.45"/>
            <rect x="160" y="46" width="22" height="84" rx="4" fill="url(#pv-g)"/>
            <path d="M40 70 Q100 20 160 44 T300 34" stroke="#4fd8e8" stroke-width="2.5" opacity="0.9"/>
            <circle cx="160" cy="44" r="4" fill="#4fd8e8"/>
            <rect x="216" y="30" width="84" height="26" rx="6" fill="rgba(79,216,232,0.1)" stroke="rgba(79,216,232,0.4)"/>
            <text x="258" y="47" text-anchor="middle" fill="#4fd8e8" font-size="11" font-family="monospace">99.9% OK</text>
          </svg>
        }
        @case ('security') {
          <svg viewBox="0 0 320 160" fill="none">
            <defs>
              <linearGradient id="pv-s" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#6d9dff"/><stop offset="1" stop-color="#9d7bff"/>
              </linearGradient>
            </defs>
            <path d="M160 22 L204 38 V78 c0 30 -20 46 -44 56 c-24 -10 -44 -26 -44 -56 V38 Z"
                  stroke="url(#pv-s)" stroke-width="2.5" fill="rgba(109,125,255,0.07)"/>
            <rect x="146" y="70" width="28" height="24" rx="5" stroke="#6d9dff" stroke-width="2.2"/>
            <path d="M151 70 v-8 a9 9 0 0 1 18 0 v8" stroke="#6d9dff" stroke-width="2.2"/>
            <circle cx="160" cy="82" r="3" fill="#6d9dff"/>
            <g font-family="monospace" font-size="10" fill="rgba(154,168,192,0.85)">
              <text x="30" y="52">RSA-2048</text>
              <text x="30" y="120">TLS 1.3</text>
              <text x="240" y="52">HMAC</text>
              <text x="240" y="120">X.509</text>
            </g>
            <g stroke="rgba(148,163,184,0.3)" stroke-dasharray="3 4">
              <line x1="82" y1="48" x2="118" y2="52"/><line x1="238" y1="48" x2="202" y2="52"/>
              <line x1="72" y1="116" x2="116" y2="108"/><line x1="236" y1="116" x2="204" y2="108"/>
            </g>
          </svg>
        }
        @case ('integration') {
          <svg viewBox="0 0 320 160" fill="none">
            <defs>
              <linearGradient id="pv-i" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#6d9dff"/><stop offset="1" stop-color="#9d7bff"/>
              </linearGradient>
            </defs>
            <rect x="24" y="58" width="76" height="44" rx="9" stroke="#6d9dff" stroke-width="2" fill="rgba(109,157,255,0.07)"/>
            <text x="62" y="84" text-anchor="middle" fill="#9aa8c0" font-size="11" font-family="monospace">Frontend</text>
            <rect x="122" y="58" width="76" height="44" rx="9" stroke="url(#pv-i)" stroke-width="2.4" fill="rgba(157,123,255,0.08)"/>
            <text x="160" y="84" text-anchor="middle" fill="#cdb8ff" font-size="11" font-family="monospace">FastAPI</text>
            <rect x="220" y="58" width="76" height="44" rx="9" stroke="#9d7bff" stroke-width="2" fill="rgba(157,123,255,0.06)"/>
            <text x="258" y="84" text-anchor="middle" fill="#9aa8c0" font-size="11" font-family="monospace">Odoo ERP</text>
            <g stroke="rgba(148,163,184,0.55)" stroke-width="1.8" fill="none">
              <path d="M100 72 h22 m-8 -5 l8 5 l-8 5"/>
              <path d="M198 72 h22 m-8 -5 l8 5 l-8 5"/>
              <path d="M220 90 h-22 m8 5 l-8 -5 l8 -5"/>
              <path d="M122 90 h-22 m8 5 l-8 -5 l8 -5"/>
            </g>
            <text x="160" y="132" text-anchor="middle" fill="rgba(154,168,192,0.7)" font-size="10" font-family="monospace">REST · business rules · workflows</text>
          </svg>
        }
        @case ('bank') {
          <svg viewBox="0 0 320 160" fill="none">
            <defs>
              <linearGradient id="pv-b" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#6d9dff"/><stop offset="1" stop-color="#9d7bff"/>
              </linearGradient>
            </defs>
            <path d="M40 62 L90 34 L140 62 Z" stroke="url(#pv-b)" stroke-width="2.4" fill="rgba(109,125,255,0.08)"/>
            <g stroke="#6d9dff" stroke-width="2.2">
              <line x1="56" y1="66" x2="56" y2="112"/><line x1="78" y1="66" x2="78" y2="112"/>
              <line x1="100" y1="66" x2="100" y2="112"/><line x1="122" y1="66" x2="122" y2="112"/>
            </g>
            <line x1="42" y1="118" x2="138" y2="118" stroke="url(#pv-b)" stroke-width="2.6"/>
            <g font-family="monospace" font-size="10" fill="rgba(154,168,192,0.9)">
              <text x="176" y="48">accounts</text>
              <text x="246" y="48">loans</text>
              <text x="176" y="84">cards</text>
              <text x="240" y="84">transfers</text>
              <text x="176" y="120">agencies</text>
              <text x="246" y="120">audit</text>
            </g>
            <g stroke="rgba(148,163,184,0.4)">
              <rect x="166" y="32" width="60" height="24" rx="6"/><rect x="236" y="32" width="52" height="24" rx="6"/>
              <rect x="166" y="68" width="54" height="24" rx="6"/><rect x="230" y="68" width="62" height="24" rx="6"/>
              <rect x="166" y="104" width="62" height="24" rx="6"/><rect x="238" y="104" width="50" height="24" rx="6"/>
            </g>
          </svg>
        }
        @case ('transfer') {
          <svg viewBox="0 0 320 160" fill="none">
            <defs>
              <linearGradient id="pv-t" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#6d9dff"/><stop offset="1" stop-color="#4fd8e8"/>
              </linearGradient>
            </defs>
            <circle cx="160" cy="80" r="52" stroke="rgba(148,163,184,0.4)" stroke-width="1.8"/>
            <ellipse cx="160" cy="80" rx="24" ry="52" stroke="rgba(148,163,184,0.3)" stroke-width="1.5"/>
            <line x1="108" y1="80" x2="212" y2="80" stroke="rgba(148,163,184,0.3)" stroke-width="1.5"/>
            <path d="M112 62 Q140 44 168 58" stroke="rgba(148,163,184,0.3)" stroke-width="1.5" fill="none"/>
            <path d="M60 108 Q160 -6 260 96" stroke="url(#pv-t)" stroke-width="2.6" stroke-dasharray="6 6" fill="none"/>
            <circle cx="60" cy="108" r="6" fill="#6d9dff"/>
            <circle cx="260" cy="96" r="6" fill="#4fd8e8"/>
            <rect x="26" y="118" width="70" height="22" rx="6" fill="rgba(109,157,255,0.1)" stroke="rgba(109,157,255,0.4)"/>
            <text x="61" y="133" text-anchor="middle" fill="#b9ccff" font-size="10.5" font-family="monospace">CAD · EUR</text>
            <rect x="226" y="106" width="70" height="22" rx="6" fill="rgba(79,216,232,0.1)" stroke="rgba(79,216,232,0.4)"/>
            <text x="261" y="121" text-anchor="middle" fill="#4fd8e8" font-size="10.5" font-family="monospace">BIF · momo</text>
          </svg>
        }
        @case ('drone') {
          <svg viewBox="0 0 320 160" fill="none">
            <g stroke="rgba(148,163,184,0.18)">
              @for (x of [60, 120, 180, 240]; track x) {
                <line [attr.x1]="x" y1="16" [attr.x2]="x" y2="144"/>
              }
              @for (y of [48, 80, 112]; track y) {
                <line x1="20" [attr.y1]="y" x2="300" [attr.y2]="y"/>
              }
            </g>
            <path d="M50 118 L120 66 L200 96 L268 40" stroke="#4fd8e8" stroke-width="2" stroke-dasharray="5 5" opacity="0.85"/>
            <g fill="#6d9dff">
              <circle cx="50" cy="118" r="5"/><circle cx="120" cy="66" r="5"/><circle cx="200" cy="96" r="5"/>
            </g>
            <circle cx="268" cy="40" r="7" fill="#9d7bff"/>
            <circle cx="268" cy="40" r="13" stroke="#9d7bff" opacity="0.5"/>
            <rect x="36" y="24" width="96" height="22" rx="5" fill="rgba(109,157,255,0.1)" stroke="rgba(109,157,255,0.4)"/>
            <text x="84" y="39" text-anchor="middle" fill="#b9ccff" font-size="10.5" font-family="monospace">inspection #142</text>
          </svg>
        }
        @default {
          <svg viewBox="0 0 320 160" fill="none">
            <defs>
              <linearGradient id="pv-p" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#6d9dff"/><stop offset="1" stop-color="#9d7bff"/>
              </linearGradient>
            </defs>
            <rect x="30" y="34" width="150" height="92" rx="12" stroke="url(#pv-p)" stroke-width="2.4" fill="rgba(109,125,255,0.07)"/>
            <rect x="46" y="52" width="44" height="10" rx="5" fill="url(#pv-p)" opacity="0.9"/>
            <rect x="46" y="94" width="70" height="8" rx="4" fill="rgba(154,168,192,0.5)"/>
            <rect x="46" y="108" width="46" height="8" rx="4" fill="rgba(154,168,192,0.3)"/>
            <circle cx="158" cy="58" r="9" stroke="#4fd8e8" stroke-width="2"/>
            <g stroke="rgba(148,163,184,0.55)" stroke-width="1.8" fill="none">
              <path d="M180 80 h36 m-9 -5 l9 5 l-9 5"/>
            </g>
            <rect x="222" y="56" width="72" height="48" rx="9" stroke="rgba(148,163,184,0.5)" stroke-width="2" fill="rgba(148,163,184,0.05)"/>
            <text x="258" y="76" text-anchor="middle" fill="#9aa8c0" font-size="10.5" font-family="monospace">API 200</text>
            <text x="258" y="92" text-anchor="middle" fill="#3ddc97" font-size="10.5" font-family="monospace">✔ signed</text>
          </svg>
        }
      }
    </div>
  `,
})
export class ProjectVisualComponent {
  kind = input<string>('payments');
}
