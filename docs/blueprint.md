# **App Name**: NEU Library Connect

## Core Features:

- Secure NEU Authentication: Implements Google OAuth, restricting access strictly to @neu.edu.ph institutional accounts. The system hardcodes admin@neu.edu.ph to automatically receive Administrator privileges and assigns appropriate user roles (Admin, Student, Faculty, Employee) upon first login.
- Dynamic Visitor Logging: Provides a streamlined interface for first-time users to complete their profile by selecting their College/Office. All users are prompted to select their 'Reason for Visiting,' with logs immediately saved to the database. Handles 'Access Denied' for blocked users by routing them to a designated screen.
- Automated Session Management: Upon successful visit logging, a prominent full-screen 'Welcome to NEU Library!' greeting is displayed. The system then automatically clears the user's session and returns to the login screen after a few seconds, ready for the next visitor.
- Admin Real-time Dashboard: A comprehensive dashboard for administrators, displaying key real-time metrics such as the current number of visitors for the day and a live feed of the most recent library check-ins, categorized by user role and department.
- Comprehensive Visit Reports: A dedicated admin page featuring a comprehensive, paginated master table of all historical library visit logs. Includes robust filtering options by date (day, week, month, custom range), user role, college/department, and reason for visiting, with a prominent button to export the filtered dataset to a CSV file.
- User Access Management: An administrative interface enabling search functionality to find specific users by name or email. Admins can view a user's full visit history and instantly toggle a 'Block/Unblock' status to restrict or restore their library system access.
- AI-Powered Visitor Trend Analysis Tool: An AI tool for administrators that can process historical visit log data to generate quick, textual summaries or identify trends, such as peak visiting hours, most popular reasons for visits, or department-specific visitor patterns over a chosen period.

## Style Guidelines:

- Primary color: '#0d73d9' (Primary Blue). A professional and engaging hue chosen to represent core interactive elements, ensuring strong visibility and clarity for call-to-actions and key buttons.
- Background color: '#f5f7f8' (Background Light). A soft, neutral light shade chosen for its high readability and clean aesthetic, providing an accessible and unobtrusive presence across the application.
- Structural color: '#001F3F' (NEU Navy). A deep, authoritative color specifically designated for prominent structural elements like headers and sidebars, establishing clear visual hierarchy and framing within the application layout.
- Accent color: '#D4AF37' (NEU Gold). A distinctive and refined shade utilized for subtle highlights, interactive states, and to draw attention to important information, adding a touch of prestige consistent with an academic institution.
- Body and headline font: 'Inter' (sans-serif). Chosen for its modern, clean lines, and excellent legibility across all text sizes. 'Inter' provides a professional and neutral tone, ideal for data-heavy displays, forms, and general content in an enterprise academic application.
- Utilize a consistent set of simple, outlined-style vector icons that are modern, minimalist, and universally understandable. Icons should effectively support navigation, delineate actions, and visually summarize data within dashboards and reports.
- The Visitor UI will employ a highly minimal, mobile-first design with centered, easily navigable components (Google Login, dropdowns). The Admin UI will feature a structured, responsive grid system for dashboards and tables, ensuring optimal data display and accessibility on various screen sizes, including desktop and mobile.
- Incorporate subtle and purposeful animations to enhance user feedback (e.g., successful form submissions, state changes), ensure smooth transitions between views or data updates, and highlight interactive elements without causing visual distraction.