import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/shared/components/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy | EduBridge",
  description: "Privacy Policy and Google API Services User Data Policy Compliance for EduBridge",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-8 border-b pb-6">
          <Logo variant="mark" size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">EduBridge Privacy Policy</h1>
            <p className="text-sm text-slate-500">Effective Date: January 1, 2026 | Last Updated: September 11, 2026</p>
          </div>
        </div>

        <div className="space-y-8 leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
            <p>
              EduBridge (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the educational platform located at{" "}
              <Link href="https://edubridge-et.vercel.app" className="text-blue-600 hover:underline">
                https://edubridge-et.vercel.app
              </Link>
              . We are dedicated to safeguarding the privacy and security of students, teachers, administrators, and visitors.
              This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Information:</strong> Full name, email address, password hashes, institution/school name, grade level, and role (Student, Teacher, School Admin, or System Admin).
              </li>
              <li>
                <strong>Google User Data (OAuth):</strong> When you choose to sign in via Google OAuth, we receive your basic public profile information: your name, verified email address, and Google account identifier. We request only the minimum scopes: <code className="bg-slate-100 px-1 py-0.5 rounded text-sm text-slate-900">openid</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-sm text-slate-900">userinfo.email</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded text-sm text-slate-900">userinfo.profile</code>.
              </li>
              <li>
                <strong>Academic Data:</strong> Class enrollments, attendance, assessments, quizzes, homework submissions, and learning analytics generated within the platform.
              </li>
              <li>
                <strong>Technical and Usage Data:</strong> IP address, browser type, device information, and activity logs to ensure platform security and prevent unauthorized access.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <p className="mb-2">We use the collected information solely for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Authenticating users and managing tenant-isolated school workspaces.</li>
              <li>Providing personalized curriculum content, assessment grading, and academic reporting.</li>
              <li>Sending essential account notifications, security verification codes, and academic announcements.</li>
              <li>Monitoring platform reliability, preventing fraudulent activity, and ensuring system uptime.</li>
            </ul>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-blue-950 mb-3">
              4. Google API Services User Data Policy Compliance (Limited Use Disclosure)
            </h2>
            <p className="text-blue-900 mb-3">
              EduBridge&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:text-blue-700"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-blue-900 text-sm">
              <li>
                <strong>No Third-Party Advertising or Selling:</strong> We do NOT sell, rent, or trade Google user data to advertisers, data brokers, or any third parties.
              </li>
              <li>
                <strong>No Unrelated Human Access:</strong> No human is permitted to read your private data unless you have given explicit consent, it is required for security investigations, or it is required to comply with applicable laws.
              </li>
              <li>
                <strong>No AI Training on Google Data:</strong> We do NOT use user data obtained via Google APIs to train generalized artificial intelligence (AI) or machine learning models without explicit authorization.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Data Storage, Security & Retention</h2>
            <p className="mb-2">
              All data is stored securely in encrypted cloud infrastructure with TLS 1.3 encryption in transit and AES-256 encryption at rest. Multi-tenant data isolation is enforced at the database level.
            </p>
            <p>
              We retain user data as long as your school or institution maintains an active account with EduBridge, or until you request account deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. User Rights and Data Deletion</h2>
            <p className="mb-2">
              You have the right to access, update, or request the permanent deletion of your personal data at any time.
            </p>
            <p>
              To request data deletion or revoke Google OAuth permissions, contact our privacy officer at{" "}
              <a href="mailto:edubridge.et@gmail.com" className="text-blue-600 hover:underline font-medium">
                edubridge.et@gmail.com
              </a>
              . Requests are processed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Contact Information</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us:</p>
            <div className="mt-3 bg-slate-100 p-4 rounded-lg text-sm">
              <p><strong>Platform:</strong> EduBridge Educational Platform</p>
              <p><strong>Website:</strong> https://edubridge-et.vercel.app</p>
              <p><strong>Support & Privacy Email:</strong> edubridge.et@gmail.com</p>
            </div>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
