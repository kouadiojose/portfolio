import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TrackingService } from './core/tracking.service';
import { FooterComponent } from './shared/footer.component';
import { HeaderComponent } from './shared/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main>
      <router-outlet />
    </main>
    <app-footer />
  `,
})
export class AppComponent {
  constructor() {
    inject(TrackingService).start();
  }
}
