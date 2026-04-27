# Design School Frontend

React/Vite single-page app for the Design School learning platform. The UI is built around a Tech-Noir course discovery experience, protected student/admin workspaces, and an interactive lesson room with progress, quizzes, and XP feedback.

## Stack

- React 19
- Vite 8
- Tailwind CSS 4
- React Router
- Framer Motion and GSAP
- Lucide React icons

## Local Setup

```bash
npm install
npm run dev
```

The app runs on `http://127.0.0.1:5173` by default.

## Environment

Create `frontend/.env.local` when you need to override the API target:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

When no value is provided, development uses the local Django API and production uses the Render API configured in `src/lib/api.js`.

## Main Routes

- `/` - marketing homepage
- `/courses` - backend-powered course discovery
- `/courses/:id` - course detail page
- `/learn/:id` - lesson player, quiz checkpoint, progress, and XP UI
- `/paths` - learning path discovery grouped from published courses
- `/blog` and `/blog/:slug` - blog listing and detail
- `/free-resources` and `/free-resources/:id` - public resources
- `/dashboard/*` - protected student workspace
- `/admin-panel` - protected admin workspace
- `/instructor-panel` - protected mentor workspace
- `/login`, `/register`, `/verify-phone` - auth flows

## Project Structure

```text
src/
  components/
    sheryians/        Shared public-site components such as Navbar and Footer
    student/          Student dashboard UI pieces
  lib/                API client, auth helpers, normalization utilities
  pages/              Route-level pages, lazy-loaded from App.jsx
  data/               Static fallback/reference data
```

## API Contract

The frontend talks to the Django REST API under `/api/v1/`.

Important frontend consumers:

- `src/lib/api.js` centralizes base URL and authenticated fetch behavior.
- `src/lib/auth.js` stores JWT session state and role helpers.
- `src/lib/courseContent.js` normalizes public course payloads for cards, detail pages, paths, and lesson rooms.

## Build

```bash
npm run build
```

Vercel should use the `frontend` directory as the project root and run the same build command.
