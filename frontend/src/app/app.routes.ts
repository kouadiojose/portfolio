import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { langGuard } from './core/lang.guard';
import { detectInitialLang } from './core/language.service';

export const routes: Routes = [
  // Admin (not language-prefixed, hidden from the public navigation)
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login.component').then((m) => m.LoginComponent),
    title: 'Admin — Connexion',
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    title: 'Admin — Yeo Yedjande',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'messages',
        loadComponent: () => import('./pages/admin/messages.component').then((m) => m.MessagesComponent),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./pages/admin/account.component').then((m) => m.AccountComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/admin/settings-editor.component').then((m) => m.SettingsEditorComponent),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./pages/admin/projects-editor.component').then((m) => m.ProjectsEditorComponent),
      },
      {
        path: 'experiences',
        loadComponent: () =>
          import('./pages/admin/experiences-editor.component').then((m) => m.ExperiencesEditorComponent),
      },
      {
        path: 'stack',
        loadComponent: () =>
          import('./pages/admin/stack-editor.component').then((m) => m.StackEditorComponent),
      },
      {
        path: 'values',
        loadComponent: () =>
          import('./pages/admin/values-editor.component').then((m) => m.ValuesEditorComponent),
      },
    ],
  },

  // Public site, language-prefixed: /en/…, /fr/…
  {
    path: ':lang',
    canActivate: [langGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'projects/:slug',
        loadComponent: () =>
          import('./pages/case-study/case-study.component').then((m) => m.CaseStudyComponent),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
      },
    ],
  },

  // Root + unknown routes → detected language
  { path: '', pathMatch: 'full', redirectTo: () => `/${detectInitialLang()}` },
  { path: '**', redirectTo: () => `/${detectInitialLang()}` },
];
