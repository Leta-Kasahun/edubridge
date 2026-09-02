# EduBridge — Completed Functional Documentation

This document provides an exhaustive, factual specification of all currently implemented functional modules, user flows, sub-features, and management capabilities within the EduBridge platform.

---

## 1. Multi-Tenant Architecture & Institution Partitioning

### 1.1. School Instance Creation & Tenant Provisioning
- **Invitation-Based Provisioning**:
  - System Admin inputs institution name, school code, domain/slug, and School Administrator's email.
  - Generates a secure invitation token with email delivery.
  - School Admin clicks the onboarding link, confirms institutional details, and activates the tenant account.
- **Direct Credentials Provisioning**:
  - System Admin provisions an institution directly with administrator first name, last name, and optional email.
  - Generates auto-generated usernames and secure temporary passwords immediately viewable and copyable upon creation.
- **Tenant Partition Management**:
  - Activation & Deactivation/Suspension lifecycle toggles.
  - Scoped data isolation ensuring no school can view or mutate records belonging to another institution.
  - Real-time institutional status tracking (`ACTIVE`, `SUSPENDED`).

---

## 2. Hierarchical Account Provisioning & Onboarding

### 2.1. Teacher Provisioning & Onboarding
- **Single Teacher Provisioning**:
  - **Invitation Method**: Dispatches an email invitation with a secure acceptance token.
  - **Direct Credentials Method**: Creates the teacher account immediately with an auto-generated username and single-use temporary password.
- **Bulk Teacher Provisioning (CSV & Excel Import)**:
  - File parser supporting `.csv` and `.xlsx` formats.
  - Live data preview grid before committing imports.
  - Column schema mapping (First Name, Last Name, Email, Phone, Subject Specialization).
  - Row-by-row error detection and reporting (`TeacherBulkErrorsSection`) highlighting invalid formats, missing fields, or duplicate emails.
  - Batch creation with downloadable/exportable credentials summary table.
- **Teacher Account Lifecycle Operations**:
  - Resend invitation email for pending teachers.
  - Credential regeneration for expired or lost temporary credentials.
  - Status management (`PENDING_FIRST_LOGIN`, `ACTIVE`, `SUSPENDED`).
  - Detailed teacher information modal with contact details, verification status, and assigned workload.

### 2.2. Student Provisioning & Onboarding
- **Single Student Provisioning**:
  - Registration with First Name, Last Name, Gender, Student ID, and assigned Grade level & Section.
  - System generates a single-use initial password.
- **Bulk Student Provisioning (CSV & Excel Import)**:
  - Multi-student file upload (`.csv`, `.xlsx`).
  - Automatic validation of grade and section names against existing academic records.
  - Error summary flagging invalid gender values, missing names, or unmatched section names.
  - Batch generation of student accounts with credentials export modal.
- **First-Login Forced Password Reset**:
  - Accounts flagged as `PENDING_FIRST_LOGIN` are automatically routed to a mandatory password change screen.
  - Account state transitions to `ACTIVE` upon setting a new password meeting security criteria.
- **Student Credential Regeneration**:
  - School Administrators and Teachers can re-issue single-use passwords for students who forgot their credentials.
- **Grade & Section Filtering Toolbar**:
  - Filter and navigate student rosters via interactive grade pills and collapsible section accordions.

### 2.3. Teacher Onboarding Wizard
- Multi-step guided wizard for newly onboarded teachers:
  - **Step 1: Personal & Contact Information** (Bio, phone number, gender, address).
  - **Step 2: Educational Qualifications** (Degrees, institutions, graduation years, document verification).
  - **Step 3: Teaching Experience** (Previous schools, roles, tenure dates).

---

## 3. Academic Structure & Curriculum Management

### 3.1. Academic Calendar Years
- Definition of academic calendar cycles (e.g., *2025/2026 Academic Year*).
- Start and end date range configuration.
- Single-active academic year enforcement with historical archive capability.

### 3.2. Grade Levels
- Creation and management of curriculum grades (e.g., Grade 9, Grade 10, Grade 11, Grade 12).
- Association with educational tiers and class sections.

### 3.3. Class Sections & Classrooms
- Creation of individual class sections under each grade (e.g., Grade 9-A, Grade 9-B).
- Classroom room number assignment and student seat capacity tracking.
- Active vs. Archived section status management.

### 3.4. Subjects & Courses
- Definition of academic subjects (e.g., Mathematics, Physics, English Literature).
- Subject codes, credit hour values, and grade-level curriculum associations.
- Active/Inactive subject availability toggling.

### 3.5. Student Assignments & Roster Management
- **Single Student Section Transfer**: Move an individual student from one class section to another with audit logging.
- **Bulk Student Section Transfer**: Batch migrate groups of students between sections within the same or different grades.
- **Academic Promotion**: Promote entire cohorts or selected students to the next grade level for a new academic year.
- **Student Withdrawal**: Withdraw/unassign students from sections with status tracking.
- **Enrollment History Tracking**: View historical records of a student's past sections, academic years, and enrollment transitions.

### 3.6. Teacher Assignments & Workload Management
- **Subject & Section Allocation**: Assign teachers to teach specific subjects within designated class sections for an academic year.
- **Teacher Workload Inspector (`TeacherLoadDetailModal`)**: View the complete distribution of classes, subjects, and student count assigned to a specific teacher.
- **Teacher Reassignment (`ReassignTeacherModal`)**: Reassign an existing subject-section workload to another qualified teacher.
- **Assignment Termination (`EndTeacherAssignmentModal`)**: Conclude teacher assignments at term or year completion.

---

## 4. Faculty Profiles & Staff Qualifications Directory

### 4.1. Teacher Profile Management
- Personal information, biographical summary, contact numbers, and employment details.
- Real-time profile completeness indicator.

### 4.2. Academic Degrees & Qualifications Repository
- Detailed educational credentials logging:
  - Degree Level: *Doctorate (PhD)*, *Master's Degree*, *Bachelor's Degree*, *Diploma / Certificate*, *Other*.
  - Field of Study / Specialization.
  - Awarding College / University Institution.
  - Year of Graduation.
  - Document / certificate attachment upload.

### 4.3. Teaching Experience History
- Chronological record of prior teaching appointments:
  - Institution / School Name.
  - Designation / Job Title.
  - Start Date and End Date (or current position indicator).
  - Key responsibilities and subject areas taught.

### 4.4. Institutional Staff Qualifications Directory (`/dashboard/staff-qualifications`)
- School Admin repository of all institutional teaching staff.
- Search by faculty name, email, or subject specialization.
- Filtering by highest qualification level (PhD, Master's, Bachelor's, Diploma).
- Detailed credential inspection modal (`StaffQualificationsDetailModal`) displaying verified degrees and employment history.
- Statistical breakdown cards summarizing faculty degree distributions across the school.

---

## 5. Security Governance & Policy Management

### 5.1. Authentication & Session Control
- JWT token pair authentication (short-lived access tokens + refresh tokens).
- Redis-backed active session management with remote session revocation.
- Two-Factor Authentication (2FA / OTP) via email for logins and critical account updates.

### 5.2. System Security Policy Manager (`/dashboard/settings`)
Configurable controls available to System Administrators:
- **Password Complexity Rules**:
  - Minimum and maximum character length constraints.
  - Requirements for uppercase letters, numbers, and special characters.
  - Password expiration timeline (in days) and forced password change flag.
- **Two-Factor Authentication (2FA)**:
  - Global 2FA enablement toggle.
  - Enforce 2FA on every login vs. email verification only.
  - OTP token validity lifetime (in minutes) and resend cooldown timers (in seconds).
  - Google Single Sign-On (SSO) toggle.
- **Session & Inactivity Lifecycle**:
  - Inactivity session timeout (in minutes).
  - Maximum allowed concurrent active sessions per user.
  - Access token lifespan configuration.
  - Automatic session revocation on password change.
- **Threat Detection & Account Lockout**:
  - Maximum failed login attempt threshold before lockout.
  - Temporary account lockout duration (in minutes).
  - Suspicious sign-in activity detection.

---

## 6. Role-Based Dashboards & Analytics Overview

### 6.1. System Administrator Dashboard
- **System Overview Tab**:
  - Metric Cards: Active Schools, Total Platform Users, Security Posture (2FA status), System Health.
  - Donut Analytics: School Instance Status (Active vs. Suspended), Platform User Base (Pupils vs. Faculty), 2FA Adoption Posture.
- **School Overview Tab**:
  - Metric Cards: Total Registered Institutions, Active Institutions, Total Student Load, Total Faculty Load.
  - Donut Analytics: Institution Status Split, Top Institutions by User Load.
  - Registered Institutions directory table with school codes, statuses, and user counts.

### 6.2. School Administrator Dashboard
- **General Overview Tab**: Total enrolled students, active teachers, active classrooms, registered curriculum courses + enrollment and class distribution donut charts.
- **Students Overview Tab**: Total enrolled, active pupils, gender breakdown (Male vs. Female), pending setup + student status and gender ratio donut charts.
- **Teachers Overview Tab**: Total teaching faculty, active faculty, email verified accounts, pending verification + teacher status, gender ratio, email verification split, and staff qualification distribution donut charts.
- **Academics Overview Tab**: Active academic years, registered grade tiers, operational sections, active courses + class section status and grade tier distribution donut charts.

### 6.3. Teacher Dashboard
- **Teaching Overview Tab**: Assigned classes, enrolled classroom pupils, active courses, profile completion status + student status split, gender ratio, assigned classrooms, and course allocation donut charts.
- **Classes Tab**: Active classroom rosters, total student count, grade tiers taught, average class size + grade distribution, class status, student gender split, and enrollment status donut charts.
- **Qualifications Tab**: Summary of personal qualifications, educational degrees, and teaching experiences.

### 6.4. Student Dashboard
- Enrolled subjects, academic term / grade level program (e.g. *2025/26 Grade 11*), GPA / standing status, and term academic records.
