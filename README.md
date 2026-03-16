# NEU Library Visitor Log

This project was developed for the Software Engineering 2 course to modernize the New Era University Library's entry process. It replaces the traditional manual pen-and-paper logbook with a secure, kiosk-oriented digital visitor management system. 

Built with Next.js and Firebase, the system allows students and faculty to seamlessly log their library visits using their institutional Google accounts, while providing administrators with a powerful dashboard to monitor and export visitor data.

## Features

* **Streamlined Visitor Flow:** * Secure Google Sign-In restricted strictly to `@neu.edu.ph` accounts.
  * Quick, one-time onboarding for new users to set their role (Student, Faculty, or Employee) and department.
  * One-click visit logging with predefined reasons for returning users.
* **Admin Dashboard & Reporting:**
  * Live monitoring of recent check-ins and activity summaries.
  * Comprehensive reports with filtering by user role, college/office, visit reason, and date range.
  * CSV export functionality for library attendance records.
  * User access management (block/unblock users).
* **Modern UI:** Responsive, glassmorphism design optimized for shared kiosk displays and desktop use.

## Tech Stack

* **Frontend:** Next.js 15 (App Router), React 19, TypeScript
* **Styling & UI:** Tailwind CSS, shadcn/ui, Lucide React
* **Backend & Database:** Firebase Authentication, Firebase Firestore

## Setup & Installation

### Prerequisites
* Node.js 18 or later
* Access to the configured Firebase project

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:9002](http://localhost:9002) in your browser to view the application. 

## Project Structure (Core)
* `src/app/login/` - Institutional email authentication
* `src/app/onboarding/` - First-time setup for roles and departments
* `src/app/log-visit/` - Kiosk interface for returning users
* `src/app/admin/` - Admin dashboard, report generation, and user management

## Author
**John Marc Sanchez**