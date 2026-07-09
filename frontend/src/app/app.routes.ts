import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Yeo Yedjande — Senior Full Stack Developer',
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects.component').then((m) => m.ProjectsComponent),
    title: 'Projects — Yeo Yedjande',
  },
  {
    path: 'projects/:slug',
    loadComponent: () =>
      import('./pages/project-detail/project-detail.component').then((m) => m.ProjectDetailComponent),
    title: 'Project — Yeo Yedjande',
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contact — Yeo Yedjande',
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login.component').then((m) => m.LoginComponent),
    title: 'Admin — Sign in',
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    title: 'Admin — Yeo Yedjande',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'messages' },
      {
        path: 'messages',
        loadComponent: () => import('./pages/admin/messages.component').then((m) => m.MessagesComponent),
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
        path: 'expertise',
        loadComponent: () =>
          import('./pages/admin/expertise-editor.component').then((m) => m.ExpertiseEditorComponent),
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
  { path: '**', redirectTo: '' },
];
