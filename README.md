# NEU Library Visitor Log
  
NEU Library Visitor Log is a kiosk-oriented visitor management system for New Era University Library. It is built with Next.js, React, Tailwind CSS, shadcn/ui, and Firebase Firestore.

The system is designed for fast shared-device usage: visitors authenticate with their institutional Google account, complete onboarding if needed, select their reason for visiting, and the visit is saved immediately. Administrators can review recent check-ins, filter visit reports, export CSV data, and manage user access.

## Overview

### Visitor Flow

- Google sign-in restricted to `@neu.edu.ph`
- First-time onboarding for role and department or office selection
- Visit logging with predefined reasons
- Returning users can go directly to the visit logging screen
- Blocked users are redirected to an access denied page

### Role Logic

- Admin access is driven by the Firestore `users.role` field
- `johnmarc.sanchez@neu.edu.ph` is auto-bootstrapped as `Admin` on first login
- Prototype quick-access actions for admin and student are still available on the login screen
- Student emails follow the pattern `firstname.lastname@neu.edu.ph`
- Staff emails typically have no dot in the local part
- Staff users complete role selection during onboarding:
   - `Faculty` selects from academic colleges
   - `Employee` selects from administrative offices

### Admin Features

- Dashboard with recent check-ins and live activity summaries
- Reports page with filters for:
   - user role
   - college or office
   - visit reason
   - date range
- CSV export for filtered reports
- User management with block and unblock controls

### UI

- Full-screen slideshow backgrounds on login, onboarding, and visit logging pages
- Glassmorphism card layout
- Responsive layout suitable for kiosk and desktop use

## Current Authentication Model

This project uses Firebase Authentication with Google sign-in.

- Users authenticate through a Google popup flow
- Only `@neu.edu.ph` accounts are accepted
- If a user does not exist in Firestore, a profile is created using their Firebase UID
- User authorization (including admin access and blocked state) is resolved from Firestore user data

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Firebase Firestore
- date-fns
- Lucide React

## Project Structure

```text
src/
   app/
      login/                Email entry
      onboarding/           First-time role and department setup
      log-visit/            Returning user visit logging
      success/              Post-check-in confirmation
      denied/               Blocked user screen
      admin/
         dashboard/          Admin summary page
         reports/            Filterable reports and CSV export
         users/              User management
   components/
      layout/               Admin layout shell
      ui/                   Reusable UI primitives
   lib/
      constants.ts          Roles, colleges, offices, visit reasons
      firebase.ts           Firestore initialization
      store.ts              Firestore-backed data helpers
```

## Setup

### Prerequisites

- Node.js 18 or later
- npm
- Access to the configured Firebase project

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

The development server runs on:

```text
http://localhost:9002
```

### Firebase Authentication Setup

1. Open Firebase Console and enable Google provider in Authentication.
2. Add localhost and production domains to authorized domains.
3. Configure `.env.local` with Firebase client keys:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

The repository also includes Genkit-related scripts in `package.json`, but the current visitor logging and admin flows documented here are based on the app’s Firestore-backed implementation.

## Data Stored

### User Records

User documents contain:

- `id`
- `email`
- `name`
- `role`
- `collegeOrOffice`
- `isBlocked`

### Visit Logs

Visit log documents contain:

- `userId`
- `userName`
- `userEmail`
- `userRole`
- `collegeOrOffice`
- `reason`
- `timestamp`

## Onboarding Rules

- New users are routed to onboarding after first login
- Students select from academic colleges
- Staff users first choose either `Faculty` or `Employee`
- Faculty users select from academic colleges
- Employee users select from administrative offices
- After onboarding, the first visit log is created immediately

## Deployment Notes

- Firebase configuration is currently defined in `src/lib/firebase.ts`
- If you switch Firebase projects, update that file first
- Before production rollout, review Firestore security rules and remove any demo shortcuts you do not want exposed

## Author

John Marc Sanchez
