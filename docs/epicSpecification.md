
## EPIC 1 — Institution & Academic Management (FR-01)
**Epic goal:** Institutions can manage their academic structure with tenant-isolated,
dynamically permissioned access.

### EDU-101 — Manage academic structure
**As an** Institution Administrator
**I want** to create and manage classes, subjects, academic years, sections, and enrollments
**So that** my institution's academic structure is correctly modeled in the system

*Acceptance Criteria*
- Given I am logged in as an Administrator, when I create a class/subject/academic year/section, then it is saved and scoped to my tenant only.
- Given a student is enrolled in a class, when I view that class, then the student appears in the roster.
- Given I attempt to view another institution's data, when I query any academic entity, then the system returns no results (tenant isolation).

**Priority:** Critical | **Story points:** 5 | **Source:** FR-01.1, FR-01.3

### EDU-102 — Dynamic permission enforcement
**As a** System (platform)
**I want** every action checked against a role × action × tenant-override permission lookup
**So that** access rules can be adjusted per institution without a code deployment

*Acceptance Criteria*
- Given a request hits any endpoint, when the Permissions Lookup Service evaluates (role, action, tenant), then it returns allow/deny before business logic executes.
- Given an Administrator edits a permission lookup row for their tenant, when a user of the affected role next performs that action, then the new rule applies immediately without a redeploy.
- Given no lookup row exists for a role/action pair, when the request is evaluated, then the system defaults to deny.

**Priority:** Critical | **Story points:** 8 | **Source:** FR-01.2

---

## EPIC 2 — Hierarchical Account Provisioning (FR-02)
**Epic goal:** Accounts are created strictly top-down (Admin → Teacher → Student) with secure,
auditable default-password onboarding for students.

### EDU-201 — Institution admin created at signup
**As a** prospective institution
**I want** an Administrator account created first at subscription sign-up
**So that** all subsequent account creation for my tenant has a clear owner

*Acceptance Criteria*
- Given a new institution subscribes, when signup completes, then exactly one Administrator account is created for that tenant.
- Given no Administrator exists yet for a tenant, when any Teacher/Student creation is attempted, then it is rejected.

**Priority:** Critical | **Story points:** 3 | **Source:** FR-02.1

### EDU-202 — Admin creates teacher accounts
**As an** Institution Administrator
**I want** to create Teacher accounts for my institution
**So that** teaching staff can access their classes and tools

*Acceptance Criteria*
- Given I am an authenticated Administrator, when I create a Teacher account, then it is linked to my tenant and the Teacher role.
- Given a non-Administrator attempts to create a Teacher account, when the request is submitted, then it is denied.

**Priority:** Critical | **Story points:** 3 | **Source:** FR-02.2

### EDU-203 — Admin/Teacher creates student accounts with default password
**As an** Administrator or Teacher
**I want** to create Student accounts that receive a system-generated, single-use default password
**So that** students can be onboarded quickly and securely

*Acceptance Criteria*
- Given I am an authenticated Administrator or Teacher, when I create a Student account, then the student is linked to my institution/class and a random single-use default password is generated and shown to me once.
- Given the default password is generated, when I check storage/logs, then the plaintext password is never persisted or logged.
- Given the account is created, when I check its state, then it is flagged "Pending First Login."

**Priority:** Critical | **Story points:** 5 | **Source:** FR-02.3, FR-02.4, FR-05.4 (security)

### EDU-204 — Forced password change on first login
**As a** Student
**I want** to be forced to set a new password on my first login
**So that** my account is secured beyond the shared default credential

*Acceptance Criteria*
- Given I log in with my default password, when authentication succeeds, then I am routed only to the password-change screen.
- Given I have not changed my password, when I try to access any other endpoint, then access is blocked.
- Given I successfully set a new password, when I log in again, then my account state becomes "Active" and I have full access.

**Priority:** Critical | **Story points:** 5 | **Source:** FR-02.5

### EDU-205 — Default password expiry and regeneration
**As an** Administrator or Teacher
**I want** unused default passwords to expire and be regenerable
**So that** locked-out or stale Student accounts can be recovered securely

*Acceptance Criteria*
- Given a default password is unused past the configurable expiry window, when a student attempts login, then the credential is rejected and flagged expired.
- Given an expired or lost credential, when an Administrator/Teacher regenerates it, then a new single-use default password is issued and the prior one is invalidated.

**Priority:** High | **Story points:** 3 | **Source:** FR-02.6

### EDU-206 — Audit log for account and credential actions
**As a** Compliance/Admin stakeholder
**I want** every account-creation and credential-reset action logged with the actor's role
**So that** provisioning activity is fully auditable

*Acceptance Criteria*
- Given any account is created or a credential is reset, when the action completes, then an audit record is written with actor, role, target account, action type, and timestamp.
- Given an auditor queries logs for a tenant, when filtering by date/action, then only that tenant's records are returned.

**Priority:** High | **Story points:** 3 | **Source:** FR-02.7

---

## EPIC 3 — Curriculum-Aligned Content & Learning Materials (FR-03)
**Epic goal:** Teachers can build and publish a structured, curriculum-tagged content library.

### EDU-301 — Content library tagged to curriculum topics
**As a** Teacher
**I want** every content item tagged to a curriculum topic/learning objective
**So that** materials map cleanly to what students need to master

*Acceptance Criteria*
- Given I create a content item, when I save it, then I must select a subject, grade, and topic/objective tag before publishing.
- Given content is tagged, when a student views their mastery breakdown, then related content items are surfaced by topic.

**Priority:** Critical | **Story points:** 5 | **Source:** FR-03.1

### EDU-302 — Author, version, and publish learning materials
**As a** Teacher
**I want** to create, version, and publish lessons, materials, assignments, quizzes, and homework
**So that** students receive up-to-date, traceable content

*Acceptance Criteria*
- Given I edit a published item, when I save changes, then a new version is recorded and the previous version remains retrievable.
- Given I publish an assignment, when students in the assigned class log in, then they see it in their task list.
- Given a student submits work, when I open the assignment, then I can view and grade the submission.

**Priority:** Critical | **Story points:** 8 | **Source:** FR-03.2

### EDU-303 — Multi-format content support
**As a** Teacher
**I want** to attach text, audio, and video/illustration formats to a content item
**So that** I can support diverse student learning needs

*Acceptance Criteria*
- Given I create a content item, when I attach media, then text, audio, and video/image formats are all supported for that item.
- Given a student opens a multi-format item, when the page loads, then all attached formats render correctly on mobile and desktop.

**Priority:** Medium | **Story points:** 5 | **Source:** FR-03.3

---

## EPIC 4 — AI-Assisted Exam Preparation & Competency Content (FR-04)
**Epic goal:** AI accelerates exam-prep and competency content creation, strictly grounded in
teacher-authored material and gated by mandatory teacher approval.

### EDU-401 — Teacher-authored Grade 8/12 question bank
**As a** Teacher
**I want** to author and maintain an official question bank aligned to Grade 8/12 exam formats
**So that** students practice against accurate, curriculum-aligned questions

*Acceptance Criteria*
- Given I add a question, when I save it, then it is tagged to subject, grade (8 or 12), and exam topic.
- Given the question bank exists, when a student starts exam-prep practice, then only teacher-authored/approved items are served.

**Priority:** Critical | **Story points:** 5 | **Source:** FR-04.1

### EDU-402 — Timed/untimed exam-simulation practice
**As a** Student (Grade 8 or 12)
**I want** to practice questions in timed or untimed exam-simulation mode
**So that** I can prepare realistically for my exam

*Acceptance Criteria*
- Given I start a practice session, when I choose timed mode, then a countdown timer is enforced and auto-submits at zero.
- Given I complete a session, when I view results, then I see per-question correctness and per-topic breakdown.

**Priority:** Critical | **Story points:** 5 | **Source:** FR-04.2

### EDU-403 — AI explanations and similar-question generation
**As a** Student
**I want** the AI to explain my wrong answers and generate similar practice items from my teacher's question bank
**So that** I understand mistakes and get more targeted practice

*Acceptance Criteria*
- Given I answer a practice question incorrectly, when I request an explanation, then the AI returns an explanation grounded in the source question/topic.
- Given I request more practice, when the AI generates similar items, then they are derived from the existing question bank, not invented independently, and are queued for teacher approval before appearing to other students as bank items.
- Given the AI generates content, when I view the result, then it is clearly not published as an official new exam question without review.

**Priority:** Critical | **Story points:** 8 | **Source:** FR-04.3

### EDU-404 — Exam-prep performance feeds mastery
**As a** Student
**I want** my exam-prep attempts to update my topic mastery
**So that** my progress view reflects real practice performance

*Acceptance Criteria*
- Given I complete an exam-prep attempt, when scoring finishes, then the relevant MasteryRecord(s) update accordingly.
- Given mastery updates, when I open my progress dashboard, then the new status is reflected immediately.

**Priority:** High | **Story points:** 3 | **Source:** FR-04.4

### EDU-405 — Class-wide exam-readiness analytics
**As a** Teacher
**I want** class-wide exam-readiness analytics per subject/topic ahead of exam dates
**So that** I can target instruction where it's needed most

*Acceptance Criteria*
- Given my class has exam-prep attempt data, when I open the readiness dashboard, then I see per-topic readiness aggregated across the class.
- Given an exam date is set, when I view the dashboard within the lead-up window, then readiness trend toward that date is shown.

**Priority:** High | **Story points:** 5 | **Source:** FR-04.5

### EDU-406 — AI-generated competency content with mandatory approval
**As a** Teacher
**I want** AI to draft competency-based assessment content for any grade/subject, queued for my review
**So that** I can scale content creation without losing quality control

*Acceptance Criteria*
- Given I request AI-drafted competency content, when generation completes, then the item enters a "Pending Review" queue and is not visible to any student.
- Given I review a pending item, when I approve it, then it becomes visible to students in the relevant class.
- Given I reject a pending item, when I submit feedback, then it is removed from the student-facing queue and logged.
- Given an item has never been approved, when any student endpoint is queried, then that item is excluded from results.

**Priority:** Critical | **Story points:** 8 | **Source:** FR-04.6, design constraint on AI content

---

## EPIC 5 — Competency-Based Assessment & Student Intelligence (FR-05)
**Epic goal:** Students and teachers get an accurate, up-to-date view of topic mastery.

### EDU-501 — Per-topic mastery status
**As a** Student
**I want** my quiz, exam, and exam-prep results to update a per-topic mastery status
**So that** I know exactly where I stand on each topic

*Acceptance Criteria*
- Given I complete any graded activity, when scoring finishes, then the relevant topic's mastery status updates to one of Not Started / Developing / Proficient / Mastered.
- Given my mastery changes, when I open my dashboard, then the updated status and last-updated date are visible.

**Priority:** High | **Story points:** 5 | **Source:** FR-05.1

### EDU-502 — Weak/strong topic and trend view
**As a** Student
**I want** to see my weak topics, strong topics, and performance trend
**So that** I can focus my study time effectively

*Acceptance Criteria*
- Given I have mastery data across multiple topics, when I open my progress view, then topics are sorted/highlighted by weakest and strongest.
- Given I have several attempts over time, when I view trend, then a simple improving/declining/stable indicator is shown per topic.

**Priority:** Medium | **Story points:** 3 | **Source:** FR-05.2

---

## EPIC 6 — Teacher Intelligence Dashboard (FR-06)
**Epic goal:** Teachers get actionable, class-level performance visibility.

### EDU-601 — Class and per-student analytics
**As a** Teacher
**I want** class-wide and per-student performance analytics, including exam-readiness for Grade 8/12 classes
**So that** I can track progress and intervene early

*Acceptance Criteria*
- Given my class has performance data, when I open the dashboard, then I see aggregate and per-student views filterable by subject/topic.
- Given I select a Grade 8/12 class, when I view the dashboard, then an exam-readiness section is included.

**Priority:** High | **Story points:** 5 | **Source:** FR-06.1

### EDU-602 — Weak-topic identification with suggested interventions
**As a** Teacher
**I want** the dashboard to flag weak topics with suggested interventions
**So that** I know what to teach or reassign next

*Acceptance Criteria*
- Given aggregate mastery data shows a weak topic for my class, when I view the dashboard, then that topic is flagged with a suggested intervention (e.g., re-teach, assign extra practice).
- Given I act on a suggestion, when I assign new content for that topic, then the assignment is created directly from the dashboard.

**Priority:** Medium | **Story points:** 5 | **Source:** FR-06.2

---

## EPIC 7 — Offline-First Access (FR-07, v2)
**Epic goal:** Core learning continues in low-connectivity environments, with reliable sync on
reconnect.

### EDU-701 — Offline content caching
**As a** Student
**I want** core content and exam-prep sets available offline once downloaded
**So that** I can keep learning without a reliable internet connection

*Acceptance Criteria*
- Given I open a downloaded lesson/question set while offline, when I navigate the app, then content renders without network access.
- Given content is updated on the server, when I reconnect, then my cached copy refreshes.

**Priority:** Critical | **Story points:** 8 | **Source:** FR-07.1

### EDU-702 — Offline attempt queueing and sync
**As a** Student
**I want** assessment/practice attempts taken offline to sync automatically when I reconnect
**So that** none of my offline work is lost

*Acceptance Criteria*
- Given I complete an attempt while offline, when I finish, then it is stored in a local sync queue.
- Given connectivity returns, when the app detects it, then queued attempts sync automatically without user action.
- Given a sync conflict occurs (e.g., duplicate/partial record), when resolution runs, then the most complete record is kept and the other is discarded/logged.

**Priority:** Critical | **Story points:** 8 | **Source:** FR-07.2

### EDU-703 — Pre-loadable content bundles
**As a** Teacher or Administrator
**I want** to pre-load content bundles for a class/term
**So that** students in low-connectivity institutions can download everything they need at once

*Acceptance Criteria*
- Given I select a class/term, when I generate a bundle, then all relevant lessons and question sets are packaged for offline download.
- Given a student downloads the bundle, when they go offline, then all bundled content is accessible.

**Priority:** High | **Story points:** 5 | **Source:** FR-07.3

### EDU-704 — Offline-enforced first-login password change
**As a** Student
**I want** the forced first-login password change to work offline
**So that** I can complete onboarding even without connectivity

*Acceptance Criteria*
- Given I am offline on first login, when I set a new password, then it is accepted locally and queued for sync.
- Given connectivity returns, when sync runs, then the new credential is confirmed server-side and the account moves to Active.

**Priority:** Medium | **Story points:** 5 | **Source:** FR-07.4

---

## EPIC 8 — In-App & Email Notification System (Admin, Teacher, Student) (v2)
**Epic goal:** Give Administrators, Teachers, and Students one unified notification system —
in-app plus email — so key events reach the right internal role without anyone needing to go
looking for them. There is no parent/guardian-facing channel anywhere in this product: SMS is
removed and no parent email or parent notification of any kind is in scope.

### EDU-801 — In-app notification center (Admin, Teacher, Student)
**As an** Admin, Teacher, or Student
**I want** a notification center inside the app showing recent events relevant to me
**So that** I can catch up on what happened without hunting through every module

*Acceptance Criteria*
- Given I open the notification bell/icon, when it loads, then I see a reverse-chronological list of my notifications, each with type, short message, timestamp, and a link to the relevant item.
- Given a new event fires for me, when it happens, then an unread badge count updates in near real-time without a full page reload.
- Given I am on any role's dashboard, when I check notifications, then I only ever see events scoped to my tenant and my role/account — never another tenant's or another user's.

**Priority:** Critical | **Story points:** 8 | **Source:** New — internal-role notification system, replaces the old parent-facing FR-08 concept entirely

### EDU-802 — Role-specific notification triggers
**As a** Platform (system)
**I want** a defined set of events that generate notifications per role
**So that** each role is told about what actually matters to them, not everything

*Acceptance Criteria*
- Given a Student-relevant event occurs (new content/assignment published, assignment graded, AI-approved practice item available, mastery status change, upcoming exam date), when it happens, then a notification is created for that Student.
- Given a Teacher-relevant event occurs (student submission received, AI-generated content pending review, class exam-readiness milestone, at-risk flag raised for their class in v3), when it happens, then a notification is created for that Teacher.
- Given an Admin-relevant event occurs (teacher invitation accepted, account lockout, permission change made, failed email delivery batch, credential regeneration performed), when it happens, then a notification is created for that Admin.
- Given an event doesn't map to any defined trigger, when it occurs, then no notification is generated (avoids notification noise from day one).

**Priority:** Critical | **Story points:** 8 | **Source:** New, ties into FR-02.7 (audit events), FR-04.6 (approval queue), FR-06 (analytics), FR-10.2 (risk flags)

### EDU-803 — Notification preferences per category
**As an** Admin, Teacher, or Student
**I want** to choose which notification categories I receive in-app and/or by email
**So that** I control my own noise level instead of getting everything by default

*Acceptance Criteria*
- Given I open notification settings, when the page loads, then I see categories (e.g., "Grading," "Content approval," "Account/security," "Assignments") each with independent in-app and email toggles.
- Given I turn off a category, when a matching event fires, then no notification is generated for that channel/category combination.
- Given security-critical categories (e.g., account lockout, password reset, permission changes), when I try to disable them, then in-app delivery cannot be turned off — only email is optional, so critical events are never fully silenced.

**Priority:** High | **Story points:** 5 | **Source:** New

### EDU-804 — Email notification delivery (Admin, Teacher, Student)
**As an** Admin, Teacher, or Student
**I want** selected notifications also sent to my registered email
**So that** I'm reached even when I'm not actively in the app

*Acceptance Criteria*
- Given an event fires and the user's preference for that category includes email, when the notification is generated, then an email is sent to their registered address with a clear subject, short body, and a deep link back into the platform.
- Given the user's account has no verified email on file (edge case for some Student accounts), when an email-eligible event fires, then the system falls back to in-app-only delivery instead of failing silently.
- Given emails are sent, when I check the message, then it never includes sensitive content like passwords, full student PII beyond what's necessary, or content that shouldn't leave the platform.

**Priority:** High | **Story points:** 5 | **Source:** New, ties into FR-05.4 security constraints (no sensitive data in unsecured channels)

### EDU-805 — Read/unread state and mark-as-read
**As an** Admin, Teacher, or Student
**I want** to see which notifications I've already read and mark them read individually or all at once
**So that** my notification list stays useful and not just a growing pile

*Acceptance Criteria*
- Given I open a notification, when I click it, then it's marked read and the unread badge count decrements.
- Given I want to clear my list, when I select "mark all as read," then every notification updates to read state in one action.
- Given I have unread notifications, when I check the badge, then the count matches exactly the number of unread items.

**Priority:** Medium | **Story points:** 3 | **Source:** New

### EDU-806 — Digest email summary (Admin, Teacher)
**As a** Teacher or Administrator
**I want** an optional daily or weekly digest email summarizing notifications instead of one email per event
**So that** high-volume roles aren't flooded with individual emails

*Acceptance Criteria*
- Given I opt into digest mode for a category, when the scheduled digest job runs, then I receive one email summarizing all matching events since the last digest, grouped by type.
- Given I have zero events in a digest period, when the job runs, then no empty digest email is sent.
- Given I switch from digest back to real-time for a category, when the change is saved, then future notifications follow the new setting immediately.

**Priority:** Medium | **Story points:** 5 | **Source:** New

### EDU-807 — Failed email delivery retry and logging
**As an** Institution Administrator
**I want** failed notification emails retried and logged
**So that** I can troubleshoot delivery issues for staff and students

*Acceptance Criteria*
- Given an email delivery fails (bounce, provider error), when the failure is reported, then the system retries per policy and logs each attempt with reason.
- Given I open the email delivery log, when I filter by user, date, or category, then I see delivery status and retry history.

**Priority:** Medium | **Story points:** 3 | **Source:** New

---

## EPIC 9 — AI Tutor (FR-09, v3)
**Epic goal:** Students get a conversational, RAG-grounded tutor built on the institution's own
content and question bank.

### EDU-901 — Conversational AI tutor grounded in institution content
**As a** Student
**I want** to ask the AI Tutor to explain concepts and give step-by-step guidance
**So that** I get help grounded in my own school's materials, not generic answers

*Acceptance Criteria*
- Given I ask the AI Tutor a question, when it responds, then the answer is retrieved from my institution's content library and question bank (RAG) and cites the source topic.
- Given the AI Tutor cannot find grounding material, when it responds, then it clearly indicates the limitation rather than fabricating an answer.

**Priority:** Critical | **Story points:** 13 | **Source:** FR-09.1

### EDU-902 — On-demand practice and homework help
**As a** Student
**I want** the AI Tutor to generate additional practice questions and homework help on demand
**So that** I can get extra support beyond assigned material

*Acceptance Criteria*
- Given I request more practice on a topic, when the AI Tutor generates items, then they are grounded in existing curriculum content and flagged for teacher visibility per FR-09.4 workflow if they become bank items.
- Given I ask for homework help, when the AI responds, then it guides rather than simply supplying final answers for graded work (configurable per teacher policy).

**Priority:** High | **Story points:** 8 | **Source:** FR-09.2

### EDU-903 — AI Tutor session logging
**As a** Teacher
**I want** every AI Tutor session logged per student
**So that** I have visibility into how students are using the tutor

*Acceptance Criteria*
- Given a student uses the AI Tutor, when the session ends, then it is logged with student, timestamp, and topic(s) discussed.
- Given I open a student's profile, when I view AI Tutor history, then I see their logged sessions.

**Priority:** High | **Story points:** 5 | **Source:** FR-09.3

### EDU-904 — AI-assisted teacher content-creation tools
**As a** Teacher
**I want** AI-assisted drafting tools for lessons and practice sets, subject to my approval
**So that** I can create content faster without losing review control

*Acceptance Criteria*
- Given I request an AI-drafted lesson/practice set, when it's generated, then it enters the same mandatory review/approval queue as other AI content (EDU-406 pattern).
- Given I approve a draft, when I publish it, then it becomes visible to my assigned classes.

**Priority:** Medium | **Story points:** 5 | **Source:** FR-09.4

---

## EPIC 10 — Classical ML At-Risk & Performance Prediction (FR-10, v3)
**Epic goal:** Teachers get early, explainable warning of students at risk of falling behind.

### EDU-1001 — At-risk scoring model
**As a** Teacher
**I want** each student scored for risk of falling behind, using engagement and mastery-trend features
**So that** I can identify who needs help before they fall further behind

*Acceptance Criteria*
- Given a student has sufficient engagement/mastery history, when the model runs, then a risk score is produced and stored as a RiskScore record.
- Given insufficient historical data exists, when scoring runs, then the student is excluded rather than given an unreliable score.

**Priority:** High | **Story points:** 13 | **Source:** FR-10.1

### EDU-1002 — Explainable risk flags
**As a** Teacher
**I want** each risk flag to show its top contributing factors
**So that** I understand why a student was flagged and can act accordingly

*Acceptance Criteria*
- Given a student is flagged at-risk, when I open the flag, then the top contributing factors (e.g., declining mastery, low engagement) are listed.
- Given a risk flag exists, when any automated process runs, then no action is taken on the student account without teacher involvement.

**Priority:** High | **Story points:** 5 | **Source:** FR-10.2

### EDU-1003 — Model performance review
**As an** Institution Administrator
**I want** model precision/recall reviewed each term against actual outcomes
**So that** I can trust the predictions are meaningful

*Acceptance Criteria*
- Given a term ends, when the review job runs, then precision/recall metrics are calculated against actual student outcomes.
- Given metrics are calculated, when I open the admin report, then I see the current term's model performance summary.

**Priority:** Medium | **Story points:** 5 | **Source:** FR-10.3

### EDU-1004 — Predictive exam-readiness scoring
**As a** Teacher
**I want** predictive exam-readiness scores for Grade 8/12 students
**So that** I can estimate who is on track to meet their target competency level before the exam

*Acceptance Criteria*
- Given a Grade 8/12 student has exam-prep and mastery history, when readiness scoring runs, then a likelihood estimate is produced against the target competency level and exam date.
- Given the score is generated, when I view it on the readiness dashboard (EDU-405), then it integrates into that existing view.

**Priority:** Medium | **Story points:** 8 | **Source:** FR-10.4

---

## EPIC 11 — Authentication: Login & Logout (All Roles)
**Epic goal:** A single, secure authentication flow serves Administrator, Teacher, and Student
roles, with proper session handling and lockout protection. (Extends FR-02 provisioning with
the ongoing auth lifecycle the SRS assumes but doesn't spell out.)

### EDU-1101 — Unified login for all roles
**As a** user of any role (Administrator, Teacher, Student)
**I want** to log in with my credentials and be routed to my role-specific dashboard
**So that** I reach the right workspace immediately

*Acceptance Criteria*
- Given valid credentials, when I submit the login form, then I am authenticated and redirected to my role's dashboard (Admin console / Teacher dashboard / Student app).
- Given invalid credentials, when I submit the login form, then I see a generic "invalid email or password" error that does not reveal which field was wrong.
- Given my account belongs to tenant A, when I log in, then my session is scoped only to tenant A's data for the duration of the session.

**Priority:** Critical | **Story points:** 5 | **Source:** New (session layer supporting FR-02)

### EDU-1102 — Logout and session termination
**As a** logged-in user
**I want** to log out and have my session fully invalidated
**So that** no one else can use my session on a shared or public device

*Acceptance Criteria*
- Given I click logout, when the action completes, then my session token is invalidated server-side, not just cleared client-side.
- Given my session is invalidated, when I press "back" or reuse an old link, then I am redirected to login, not shown cached authenticated content.

**Priority:** Critical | **Story points:** 3 | **Source:** New

### EDU-1103 — Session expiry and refresh
**As a** logged-in user
**I want** my session to expire after inactivity and refresh seamlessly while I'm active
**So that** my account stays secure without constant re-logins during active use

*Acceptance Criteria*
- Given I am inactive past the configured timeout, when I next act, then I am logged out and prompted to log in again.
- Given I am actively using the app, when my token nears expiry, then it refreshes transparently without interrupting my work.

**Priority:** High | **Story points:** 5 | **Source:** New

### EDU-1104 — Failed-login lockout and rate limiting
**As a** platform security owner
**I want** repeated failed login attempts throttled and temporarily locked
**So that** the platform resists credential-stuffing and brute-force attacks — especially important given Student accounts start on a shared default-password pattern

*Acceptance Criteria*
- Given N consecutive failed attempts on one account (configurable), when the next attempt is made, then the account is temporarily locked and the attempt is logged.
- Given an account is locked, when the lockout window elapses, then login is automatically re-enabled.
- Given a lockout occurs, when an Administrator/Teacher checks the audit log (EDU-206), then the lockout event is visible.

**Priority:** High | **Story points:** 5 | **Source:** New, ties to FR-02.7 audit requirement

---

## EPIC 12 — Teacher Invitation & Onboarding
**Epic goal:** Administrators invite teachers by email rather than creating credentials
directly, so teachers set up their own secure password from the start (contrast with the
default-password flow used for Students, which stays as-is per FR-02.4).

### EDU-1201 — Admin sends teacher invitation
**As an** Institution Administrator
**I want** to invite a teacher by entering their email address
**So that** the teacher can set up their own account instead of being handed a credential

*Acceptance Criteria*
- Given I enter a teacher's email and submit, when the invitation is sent, then a unique, single-use, time-limited invitation link is emailed to that address.
- Given I check my pending invitations list, when I open it, then I see status (Pending / Accepted / Expired) per invite.
- Given I invite an email already registered in my tenant, when I submit, then I get a clear error instead of a duplicate account.

**Priority:** Critical | **Story points:** 5 | **Source:** New extension of FR-02.2

### EDU-1202 — Teacher accepts invitation and completes signup
**As an** invited Teacher
**I want** to open my invitation link and set my own password
**So that** I can access my institution's platform securely

*Acceptance Criteria*
- Given I open a valid, unexpired invitation link, when I set a password meeting policy (EDU-1304), then my Teacher account is created and linked to the inviting Administrator's tenant.
- Given I open an already-accepted invitation link, when I try to use it again, then I'm told it's already used and directed to log in instead.
- Given the account is created, when I check the audit log, then it records this Teacher account as created via invitation, with the inviting Admin as actor.

**Priority:** Critical | **Story points:** 5 | **Source:** New extension of FR-02.2, FR-02.7

### EDU-1203 — Invitation expiry and resend
**As an** Institution Administrator
**I want** unused invitations to expire and be resendable
**So that** stale invite links can't be exploited and teachers who missed the email can still join

*Acceptance Criteria*
- Given an invitation is unused past the configured expiry window, when the teacher tries to open it, then it is rejected as expired.
- Given an invitation has expired or wasn't received, when I click "resend," then a new invitation link is generated and the old one is invalidated.

**Priority:** Medium | **Story points:** 3 | **Source:** New, mirrors FR-02.6 pattern for Students

### EDU-1204 — Revoke a pending invitation
**As an** Institution Administrator
**I want** to revoke a pending teacher invitation
**So that** I can correct mistakes (wrong email, staff who withdrew) before they join

*Acceptance Criteria*
- Given a pending invitation exists, when I revoke it, then the link becomes invalid immediately and its status shows "Revoked."
- Given a revoked link is opened, when the teacher tries to accept it, then they see a clear "this invitation is no longer valid" message.

**Priority:** Medium | **Story points:** 2 | **Source:** New

---

## EPIC 13 — Password Management (Self-Service, All Roles)
**Epic goal:** Beyond the forced first-login change (FR-02.5), every role can manage their own
password securely, appropriate to how each role authenticates.

### EDU-1301 — Student changes password anytime
**As a** Student
**I want** to change my password from my account settings whenever I want
**So that** I'm not stuck with the password I set at first login forever

*Acceptance Criteria*
- Given I am logged in and Active, when I go to account settings and submit a current + new password, then my password updates after current-password verification.
- Given my new password doesn't meet policy (EDU-1304), when I submit, then I see a specific validation error and the change is rejected.

**Priority:** High | **Story points:** 3 | **Source:** New extension of FR-02.5

### EDU-1302 — Teacher/Administrator changes own password
**As a** Teacher or Administrator
**I want** to change my own password from account settings
**So that** I can rotate my credentials without needing another admin's help

*Acceptance Criteria*
- Given I am logged in, when I submit current + new password, then it updates after verification, following the same flow as EDU-1301.
- Given the change succeeds, when it completes, then all my other active sessions are invalidated and I must log in again on those devices.

**Priority:** High | **Story points:** 3 | **Source:** New

### EDU-1303 — Forgot-password recovery for Teachers and Administrators
**As a** Teacher or Administrator
**I want** to request a password reset via my registered email if I forget my password
**So that** I can regain access without depending on another staff member

*Acceptance Criteria*
- Given I enter my email on "forgot password," when I submit, then a time-limited reset link is emailed if the account exists (same response shown either way, to avoid account enumeration).
- Given I open a valid reset link, when I set a new password, then it must meet policy (EDU-1304) and the link becomes single-use.
- **Note:** Students do not have this self-service path by design — they rely on Administrator/Teacher-issued credential regeneration (FR-02.6 / EDU-205), since many students may not have a personal recovery email.

**Priority:** High | **Story points:** 5 | **Source:** New

### EDU-1304 — Password policy enforcement
**As a** platform security owner
**I want** a consistent password policy enforced at every password-set point (first login, self-change, reset, teacher invitation)
**So that** account security is consistent regardless of entry path

*Acceptance Criteria*
- Given any password is being set, when it doesn't meet the configured minimum length/complexity, then the system rejects it with a specific reason.
- Given the policy is met, when the password is stored, then it is hashed (never stored or logged in plaintext), consistent with FR-05.4.

**Priority:** Critical | **Story points:** 3 | **Source:** Extends FR-05.4 security requirement

---

## EPIC 14 — Institution Administrator Account Lifecycle
**Epic goal:** The Administrator — the top of the provisioning hierarchy — has the same
login/logout/password tooling as everyone else, plus institution-level profile management and
a safe recovery path since no higher role exists to reset them.

### EDU-1401 — Admin profile and institution settings
**As an** Institution Administrator
**I want** to manage my own profile and my institution's basic settings (name, language, timezone)
**So that** the platform reflects my institution correctly

*Acceptance Criteria*
- Given I open institution settings, when I update name/language/timezone, then changes save and apply platform-wide for my tenant (e.g., the language used for in-app and email notifications per Epic 8).
- Given I update my own profile, when I save, then only my tenant's data and my own account are affected.

**Priority:** Medium | **Story points:** 3 | **Source:** New, supports Epic 8 notification localization

### EDU-1402 — Administrator account recovery (support-assisted)
**As an** Institution Administrator who is locked out
**I want** a support-assisted recovery path (since no one above me in the tenant can reset my password)
**So that** my institution isn't permanently locked out of its own account

*Acceptance Criteria*
- Given I am locked out and self-service reset (EDU-1303) fails or my email is inaccessible, when I contact platform support, then a verified identity-check process exists before any reset is issued.
- Given a support-assisted reset is issued, when it completes, then the action is logged with the support agent as actor and flagged as a privileged recovery action distinct from normal self-service resets.

**Priority:** Medium | **Story points:** 5 | **Source:** New — closes a gap in FR-02's top-down hierarchy

---

## EPIC 15 — Multi-Tenancy Implementation
**Epic goal:** Every institution's data is fully isolated on a shared platform, from signup
through every subsequent read/write, per the SRS's "mandatory from v1" constraint.

### EDU-1501 — Tenant provisioning at institution signup
**As a** Platform (system)
**I want** a new isolated tenant context created at institution signup
**So that** every subsequent record for that institution is correctly scoped

*Acceptance Criteria*
- Given a new institution completes signup, when provisioning runs, then a unique tenant_id is generated and the initial Administrator account (EDU-201) is bound to it.
- Given a tenant is provisioned, when any table is queried by a user of that tenant, then a tenant_id filter is enforced at the data-access layer by default (fail-closed, not opt-in per query).

**Priority:** Critical | **Story points:** 8 | **Source:** Section 2.5 design constraint, FR-01.3

### EDU-1502 — Tenant data isolation enforcement across all modules
**As a** Platform (system)
**I want** tenant isolation enforced consistently across academic, content, exam-prep, assessment, and analytics modules
**So that** no institution can ever see another institution's data, intentionally or accidentally

*Acceptance Criteria*
- Given any API endpoint across any module, when a request is made, then tenant-isolation middleware validates the requester's tenant_id matches the resource's tenant_id before returning data.
- Given a cross-tenant access attempt is made (e.g., guessed ID), when it's evaluated, then it returns not-found rather than forbidden, to avoid leaking existence of the resource.
- Given this is a shared-schema design, when a new table/module is added, then it must include tenant_id in its schema before it can ship (add to Definition of Done).

**Priority:** Critical | **Story points:** 13 | **Source:** FR-01.3, Section 2.5

### EDU-1503 — Tenant-level configuration overrides
**As an** Institution Administrator
**I want** to configure tenant-specific settings (permission overrides, notification/email language, branding basics)
**So that** the platform adapts to my institution without needing a custom build

*Acceptance Criteria*
- Given I set a tenant-level permission override (role × action), when it's saved, then it takes precedence over the platform default for my tenant only (feeds EPIC 16).
- Given I change tenant-level settings, when other tenants are checked, then their configuration is completely unaffected.

**Priority:** High | **Story points:** 5 | **Source:** FR-01.2 tenant-override, Section 2.5

### EDU-1504 — Cross-tenant isolation testing and monitoring
**As a** platform security owner
**I want** automated tests and monitoring that continuously verify tenant isolation
**So that** isolation regressions are caught before they reach production

*Acceptance Criteria*
- Given a CI pipeline run, when isolation tests execute, then they assert that a seeded tenant-B request cannot read/write tenant-A fixtures across every module.
- Given production traffic is monitored, when any request's resolved tenant_id doesn't match the authenticated user's tenant, then it's blocked and alerted on.

**Priority:** High | **Story points:** 8 | **Source:** New — operationalizes the "mandatory" isolation constraint

---

## EPIC 16 — Dynamic Permission Lookup & Role Configuration
**Epic goal:** Administrators can view and adjust their institution's role × action permissions
through a UI, without ever needing a code change — the mechanism FR-01.2 describes, made
concretely configurable.

### EDU-1601 — Permission matrix management UI
**As an** Institution Administrator
**I want** a UI showing my tenant's role × action permission matrix
**So that** I can see and adjust who can do what, without contacting support

*Acceptance Criteria*
- Given I open the permissions screen, when it loads, then I see a matrix of roles (Administrator, Teacher, Student) against actions, with allow/deny toggles.
- Given I toggle a permission and save, when the Permissions Lookup Service next evaluates that role/action for my tenant, then the new value applies immediately (no redeploy — matches EDU-102).
- Given I attempt to disable an Administrator's own core account-management permissions, when I try to save, then the system blocks it to prevent tenant lockout.

**Priority:** Critical | **Story points:** 8 | **Source:** FR-01.2

### EDU-1602 — Default permission template for new tenants
**As a** Platform (system)
**I want** every new tenant provisioned with a sensible default permission matrix
**So that** institutions work correctly out of the box before any admin customization

*Acceptance Criteria*
- Given a new tenant is provisioned (EDU-1501), when the Permissions Lookup Service is seeded, then default role × action rows are created matching the SRS's baseline access model (e.g., only Admin creates Teachers, Admin/Teacher creates Students).
- Given the default template is seeded, when an Administrator opens the permissions screen for the first time, then they see these defaults pre-populated, not a blank matrix.

**Priority:** Critical | **Story points:** 3 | **Source:** FR-01.2

### EDU-1603 — Permission change audit trail
**As a** Compliance/Admin stakeholder
**I want** every permission change logged with who changed what and when
**So that** access-control changes are fully auditable, consistent with account-action logging (FR-02.7)

*Acceptance Criteria*
- Given a permission row is changed, when the save completes, then an audit record captures the actor, tenant, role, action, old value, new value, and timestamp.
- Given I view the permissions audit log, when I filter by date range, then I can trace exactly when and by whom access to any action was changed.

**Priority:** High | **Story points:** 3 | **Source:** FR-02.7 pattern applied to FR-01.2

### EDU-1604 — Guardrails against invalid or unsafe permission states
**As a** Platform (system)
**I want** validation rules preventing permission configurations that would break provisioning or lock out an institution
**So that** an Administrator's misconfiguration can't brick their own tenant

*Acceptance Criteria*
- Given a proposed permission change would leave no role able to create Administrator-successor actions or Student accounts, when it's submitted, then the system rejects it with an explanation.
- Given the top-down provisioning order (Admin → Teacher → Student) is foundational, when any permission change is attempted that would invert or break that order, then it is blocked.

**Priority:** High | **Story points:** 5 | **Source:** FR-02.1, design constraint in Section 2.5

---

## Suggested Jira setup notes

- **Issue hierarchy:** Epic (16 epics above) → Story → Sub-task (split any story >8 points during sprint planning, e.g., EDU-406 into "generation," "review queue UI," "approval workflow"; EDU-1502 into "middleware," "per-module rollout," "isolation tests").
- **Components:** Provisioning, Content, Exam-Prep, Assessment, Analytics, Offline, Notifications, AI-Tutor, ML-Prediction, Auth, Invitations, Password-Mgmt, Multi-Tenancy, Permissions. (SMS component removed — no SMS gateway is used anywhere in this backlog anymore.)
- **Note on Epic 8:** This epic replaces the SRS's original Parent/Guardian SMS notifications (FR-08) entirely. There is no parent/guardian-facing channel in this backlog — no SMS, no parent email, no parent notification of any kind. Admin, Teacher, and Student get in-app + email notifications through one shared system (EDU-801–807). If parent communication is ever reintroduced as a future requirement, it would need its own new epic and its own product decision — it is intentionally out of scope here, not just deferred.
- **Fix versions:** map directly to `v1`, `v2`, `v3` per the SRS roadmap. Epics 11–16 (auth, invitations, password mgmt, admin lifecycle, multi-tenancy, permissions) are foundational — sequence them into **v1, ahead of or alongside Epics 1–6**, since nearly everything else depends on them working correctly first.
- **Build-order recommendation:** EDU-1501/1502 (tenant provisioning + isolation) → EDU-1601/1602 (permission lookup + default template) → EDU-201/202/203 (account provisioning) → EDU-1101–1104 (login/logout/session) → EDU-1201–1204 (teacher invitations) → EDU-1301–1304 (password self-service) → everything else. Provisioning, auth, and permissions are load-bearing for the rest of the backlog.
- **Definition of Done** (apply platform-wide, add as a Jira DoD template): tenant isolation verified (EDU-1502); permission lookup covers the new action (EDU-1601); audit logging in place for any account/permission/content-approval action (EDU-206/EDU-1603); AI-generated content never reaches a student without an approval step; passwords never stored/logged in plaintext (EDU-1304); accessibility (WCAG 2.1 AA) checked for any new UI.
- **Cross-epic dependencies to flag in Jira:** EDU-406/EDU-904 (AI approval queue) is shared infrastructure — build once, reuse across Epics 4 and 9. EDU-1004 depends on EDU-405's readiness dashboard. EDU-1601 (permission UI) depends on EDU-102 (lookup service) and EDU-1501 (tenant provisioning) both existing first. EDU-1202 (teacher accepts invite) depends on EDU-1304 (password policy) for validation.