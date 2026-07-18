import { Component, input } from '@angular/core';

/** Product-style mockup for case studies: a browser frame with a detailed,
 *  stylized interface per project kind. Pure HTML/CSS — enterprise projects
 *  are confidential, so these are honest illustrations, not screenshots. */
@Component({
  selector: 'app-case-mock',
  template: `
    <figure class="case-mock">
      <div class="mock-browser">
        <div class="mock-bar">
          <i></i><i></i><i></i>
          <span class="mock-url">{{ url() }}</span>
        </div>

        @switch (kind()) {
          @case ('monitoring') {
            <div class="mock-app">
              <aside class="mock-side">
                <div class="mock-logo"></div>
                <div class="mock-nav on"></div>
                <div class="mock-nav"></div>
                <div class="mock-nav"></div>
                <div class="mock-nav"></div>
              </aside>
              <div class="mock-main">
                <div class="mock-kpis">
                  <div class="mock-kpi"><b>247</b><span>Sources</span></div>
                  <div class="mock-kpi ok"><b>99.2%</b><span>Fresh</span></div>
                  <div class="mock-kpi warn"><b>12</b><span>Anomalies</span></div>
                  <div class="mock-kpi"><b>1.8M</b><span>Rows/day</span></div>
                </div>
                <div class="mock-chart">
                  @for (h of [42, 68, 55, 80, 62, 90, 74, 58, 85, 70, 94, 66]; track $index) {
                    <i [style.height.%]="h"></i>
                  }
                </div>
                <div class="mock-rows">
                  @for (w of [92, 78, 85, 64]; track $index) {
                    <div class="mock-row">
                      <span class="mock-cell" [style.width.%]="w"></span>
                      <span class="mock-pill" [class.ok]="$index !== 2" [class.warn]="$index === 2"></span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
          @case ('bank') {
            <div class="mock-app">
              <aside class="mock-side">
                <div class="mock-logo"></div>
                @for (i of [0, 1, 2, 3, 4, 5]; track i) {
                  <div class="mock-nav" [class.on]="i === 1"></div>
                }
              </aside>
              <div class="mock-main">
                <div class="mock-modules">
                  @for (label of ['Accounts', 'Loans', 'Cards', 'Transfers', 'Agencies', 'Audit']; track label) {
                    <div class="mock-module"><i></i><span>{{ label }}</span></div>
                  }
                </div>
                <div class="mock-rows">
                  @for (w of [88, 72, 81, 69, 90]; track $index) {
                    <div class="mock-row">
                      <span class="mock-avatar"></span>
                      <span class="mock-cell" [style.width.%]="w - 14"></span>
                      <span class="mock-amount"></span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
          @case ('transfer') {
            <div class="mock-app mock-center">
              <div class="mock-phone">
                <div class="mock-phone-head"></div>
                <div class="mock-amount-big">250 CAD</div>
                <div class="mock-line short"></div>
                <div class="mock-flow">
                  <span class="mock-node"></span><i></i><span class="mock-node alt"></span>
                </div>
                <div class="mock-cta"></div>
              </div>
              <div class="mock-steps">
                @for (step of ['Amount', 'Recipient', 'Mobile money', 'Confirmation']; track step; let i = $index) {
                  <div class="mock-step" [class.done]="i < 3">
                    <span class="mock-check">{{ i < 3 ? '✓' : '4' }}</span>{{ step }}
                  </div>
                }
              </div>
            </div>
          }
          @case ('integration') {
            <div class="mock-app mock-console">
              <div class="mock-pipeline">
                @for (stage of ['Frontend', 'FastAPI', 'Rules', 'Odoo ERP']; track stage; let i = $index) {
                  <div class="mock-stage" [class.hot]="i === 1">{{ stage }}</div>
                  @if (i < 3) { <i class="mock-arrow">→</i> }
                }
              </div>
              <pre class="mock-json">POST /api/payments/settle
&#123;
  "order_id": "SO-2024-1187",
  "amount": 1250000,
  "currency": "XOF",
  "status": <b>"validated"</b>,
  "erp_ref": "odoo:account.move:8841"
&#125;</pre>
            </div>
          }
          @default {
            <div class="mock-app">
              <aside class="mock-side">
                <div class="mock-logo"></div>
                @for (i of [0, 1, 2, 3]; track i) {
                  <div class="mock-nav" [class.on]="i === 0"></div>
                }
              </aside>
              <div class="mock-main">
                <div class="mock-kpis">
                  <div class="mock-kpi"><b>1,842</b><span>Payments</span></div>
                  <div class="mock-kpi ok"><b>98.7%</b><span>Success</span></div>
                  <div class="mock-kpi"><b>Keycloak</b><span>SSO active</span></div>
                </div>
                <div class="mock-rows">
                  @for (w of [86, 74, 90, 68, 79]; track $index) {
                    <div class="mock-row">
                      <span class="mock-cell" [style.width.%]="w - 16"></span>
                      <span class="mock-pill ok"></span>
                      <span class="mock-amount"></span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        }
      </div>
      <figcaption class="mock-caption">{{ caption() }}</figcaption>
    </figure>
  `,
})
export class CaseMockComponent {
  kind = input<string>('payments');
  url = input<string>('app.internal — production');
  caption = input<string>('');
}
