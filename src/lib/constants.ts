export const COLLEGES = [
  // Academic Colleges & Schools
  "School of Graduate Studies",
  "College of Law",
  "College of Medicine",
  "Integrated School",
  "College of Accountancy",
  "College of Agriculture",
  "College of Arts and Science",
  "College of Business Administration",
  "College of Communication",
  "College of Informatics and Computing Studies",
  "College of Criminology",
  "College of Education",
  "College of Engineering and Architecture",
  "College of Medical Technology",
  "College of Midwifery",
  "College of Music",
  "College of Nursing",
  "College of Physical Therapy",
  "College of Respiratory Therapy",
  "School of International Relations"
] as const;

export const OFFICES = [
  // Administrative Offices (Faculty & Employees)
  "Office of the President",
  "Office of the Vice President for Academic Affairs",
  "Office of the Vice President for Administration",
  "Office of the Registrar",
  "Human Resources Office",
  "Finance and Accounting Office",
  "Library Services",
  "Information Technology Office",
  "Student Affairs and Services Office",
  "Research and Development Office",
  "Guidance and Counseling Office",
  "Campus Ministry Office",
  "Property and Procurement Office",
  "Security and Safety Office",
  "Medical and Dental Clinic",
  "Public Relations and Communications Office",
  "Admissions Office"
] as const;

export const REASONS = [
  "Reading",
  "Research",
  "Use of Computer",
  "Studying",
  "Meeting"
] as const;

export type UserRole = "Admin" | "Student" | "Faculty" | "Employee";

export const ALLOWED_DOMAIN = "@neu.edu.ph";
export const ADMIN_EMAIL = "johnmarc.sanchez@neu.edu.ph";
export const ADMIN_EMAILS = [
  ADMIN_EMAIL,
  "admin@neu.edu.ph",
  "jcesperanza@neu.edu.ph"
] as const;
