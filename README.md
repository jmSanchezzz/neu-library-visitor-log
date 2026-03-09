# NEU Library Visitor Log

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Genkit](https://img.shields.io/badge/Genkit-AI_Analysis-orange?style=for-the-badge)
![ShadCN UI](https://img.shields.io/badge/ShadCN_UI-Components-black?style=for-the-badge)

A high-fidelity visitor management system designed for **New Era University Library**. This application streamlines the check-in process for students, faculty, and employees while providing administrators with powerful AI-driven insights and comprehensive reporting tools.

## 🚀 Key Features

### 🏫 Institutional Portal
- **Domain-Restricted Authentication:** Secure login exclusive to `@neu.edu.ph` institutional accounts.
- **Dynamic Onboarding:** Profile completion for first-time visitors to capture department and affiliation.
- **Seamless Check-in:** Intuitive interface for logging visit purposes (Research, Studying, Meetings, etc.).

### 🛡️ Administrative Console
- **Real-time Dashboard:** Live tracking of daily visitors, peak hours, and top-performing departments.
- **AI Trend Analysis:** Powered by **Google Genkit**, providing automated textual summaries of historical usage patterns and hidden trends.
- **Advanced Reporting:** Comprehensive logs with multi-parameter filtering (Date Range, Role, Department) and **CSV Export** functionality.
- **Access Control:** Centralized user management with the ability to restrict or block access in real-time.

### 🎨 Design & UX
- **Cinematic Interface:** Modern dark-navy and gold aesthetic matching institutional branding.
- **Glassmorphism UI:** Sophisticated translucent cards and backdrop blur effects.
- **Responsive Layout:** Fully optimized for desktop kiosks and mobile devices.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library:** [React 19](https://react.dev/) with [ShadCN UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI Engine:** [Google Genkit](https://github.com/firebase/genkit) (Gemini 2.5 Flash)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Date Handling:** [date-fns](https://date-fns.org/)
- **State/Store:** Mock In-Memory Store with LocalStorage Persistence

## 📦 Setup & Installation

Follow these steps to get the project running locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/johnmarcsanchez/neu-library-visitor-log.git
   cd neu-library-visitor-log
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:9002](http://localhost:9002) in your browser.

## ✒️ Author

**John Marc Sanchez**
- GitHub: [@johnmarcsanchez](https://github.com/johnmarcsanchez)
- Project: NEU Library Visitor Log

---
*Built with passion for the NEU Community.*