# PrepRoute Test Management

PrepRoute is a React + TypeScript test-management frontend for creating tests, adding MCQ questions, previewing, and publishing assessments.

## Installation

```bash
npm install
npm run dev
```

The local dev server runs on `http://127.0.0.1:5173`.

## Build

```bash
npm run build
npm run preview
```

`npm run build` runs TypeScript project checks and creates the production bundle in `dist/`.

## Environment Variables

Create a `.env` file when a custom API host is needed:

```bash
VITE_API_BASE_URL=/api
VITE_BACKEND_URL=http://localhost:4000
```

`VITE_API_BASE_URL` controls the Axios base URL used by the application. `VITE_BACKEND_URL` is used by the Vite dev proxy.

## Folder Structure

```text
src/
  api/         Axios client and auth token storage
  hooks/       Shared React hooks
  pages/       Route-level screens
  services/    API service modules and API type mapping
  store/       Zustand state
  ui/          App shell and reusable UI components
  styles.css   Tailwind component layer and responsive styles
```

## Architecture

The app keeps route-level concerns in `src/pages`, API calls in `src/services`, and shared visual primitives in `src/ui`. Axios is centralized in `src/api/client.ts` for auth headers, request timeout, and friendly error messages. Zustand is used only for shared builder rail state, keeping form state local through React Hook Form and Zod validation.

## Libraries Used

- React and React DOM
- TypeScript
- React Router
- Zustand
- React Hook Form
- Zod
- Axios
- Tailwind CSS
- Lucide React
- React Hot Toast

## Features

- Protected dashboard and test creation flow
- Test list with statistics, search, pagination, empty state, retry state, and optimistic delete
- Test detail form with validation and unsaved-change protection
- Question creation workflow with local optimistic updates
- Preview and publish workflow with rollback on publish failure
- Skeleton loading states across dashboard, forms, question list, and preview
- Global error boundary and production 404 screen
- Friendly API error handling for auth, permissions, validation, missing resources, server errors, network errors, and timeouts
- Responsive layout for mobile, tablet, and desktop

## Deployment

Build the static app with `npm run build`, then deploy the generated `dist/` directory to any static hosting provider. Configure the host to serve `index.html` for unknown routes so React Router can handle client-side navigation.

## Trade-offs

- The project keeps the existing architecture and UI language instead of introducing a larger data-fetching abstraction.
- Optimistic updates are scoped to the current screens to avoid changing API contracts.
- Unsaved-change protection uses browser-native confirmation for refresh/close and same-origin link interception for in-app links.
