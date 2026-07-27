import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth.service';

/** Admin account management: login email and password. */
@Component({
  selector: 'app-admin-account',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Compte</h1>
    <p class="admin-sub">Vos identifiants d'administration. Connecté en tant que <strong>{{ currentEmail() || '…' }}</strong></p>

    <div class="admin-panel">
      <h2>Email de connexion</h2>
      <form class="form" [formGroup]="emailForm" (ngSubmit)="changeEmail()">
        <div class="form-row">
          <div class="form-field">
            <label>Nouvel email</label>
            <input type="email" formControlName="new_email" autocomplete="username">
          </div>
          <div class="form-field">
            <label>Mot de passe actuel <span class="hint">(requis pour confirmer)</span></label>
            <input type="password" formControlName="password" autocomplete="current-password">
          </div>
        </div>
        @if (emailMessage()) {
          <div class="alert" [class.alert-success]="emailOk()" [class.alert-error]="!emailOk()">
            {{ emailMessage() }}
          </div>
        }
        <div>
          <button class="btn btn-primary" type="submit" [disabled]="emailForm.invalid || busy()">
            Mettre à jour l'email
          </button>
        </div>
      </form>
    </div>

    <div class="admin-panel">
      <h2>Mot de passe</h2>
      <form class="form" [formGroup]="passwordForm" (ngSubmit)="changePassword()">
        <div class="form-row">
          <div class="form-field">
            <label>Mot de passe actuel</label>
            <input type="password" formControlName="current_password" autocomplete="current-password">
          </div>
          <div class="form-field">
            <label>Nouveau mot de passe <span class="hint">(min. 8 caractères)</span></label>
            <input type="password" formControlName="new_password" autocomplete="new-password">
          </div>
        </div>
        @if (passwordMessage()) {
          <div class="alert" [class.alert-success]="passwordOk()" [class.alert-error]="!passwordOk()">
            {{ passwordMessage() }}
          </div>
        }
        <div>
          <button class="btn btn-primary" type="submit" [disabled]="passwordForm.invalid || busy()">
            Mettre à jour le mot de passe
          </button>
        </div>
      </form>
    </div>

    <div class="admin-panel">
      <h2>Bon à savoir</h2>
      <p style="color: var(--text-2); font-size: 14px;">
        Vos identifiants vivent en base de données — les changements sont immédiats et survivent aux redéploiements.
        Les variables d'environnement <code>ADMIN_EMAIL</code> / <code>ADMIN_PASSWORD</code> ne servent
        qu'à créer le tout premier compte quand la base est vide.
      </p>
    </div>
  `,
})
export class AccountComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  currentEmail = signal('');
  busy = signal(false);
  emailMessage = signal('');
  emailOk = signal(false);
  passwordMessage = signal('');
  passwordOk = signal(false);

  emailForm = this.fb.nonNullable.group({
    new_email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  passwordForm = this.fb.nonNullable.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.auth.me().subscribe((me) => this.currentEmail.set(me.email));
  }

  changeEmail(): void {
    if (this.emailForm.invalid) return;
    this.busy.set(true);
    const { new_email, password } = this.emailForm.getRawValue();
    this.auth.changeEmail(password, new_email).subscribe({
      next: () => {
        this.busy.set(false);
        this.emailOk.set(true);
        this.emailMessage.set(`Email mis à jour — vous êtes maintenant connecté en tant que ${new_email}.`);
        this.currentEmail.set(new_email);
        this.emailForm.reset();
      },
      error: (err) => {
        this.busy.set(false);
        this.emailOk.set(false);
        this.emailMessage.set(
          err.status === 400
            ? 'Mot de passe incorrect.'
            : err.status === 409
              ? 'Cet email est déjà utilisé.'
              : 'Échec de la mise à jour. Veuillez réessayer.'
        );
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.busy.set(true);
    const { current_password, new_password } = this.passwordForm.getRawValue();
    this.auth.changePassword(current_password, new_password).subscribe({
      next: () => {
        this.busy.set(false);
        this.passwordOk.set(true);
        this.passwordMessage.set('Mot de passe mis à jour.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.busy.set(false);
        this.passwordOk.set(false);
        this.passwordMessage.set(
          err.status === 400 ? 'Mot de passe actuel incorrect.' : 'Échec de la mise à jour du mot de passe.'
        );
      },
    });
  }
}
