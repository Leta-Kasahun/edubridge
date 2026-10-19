import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/shared/components/Logo";

export const metadata: Metadata = {
  title: "Terms of Service | EduBridge",
  description: "Terms of Service for EduBridge Educational Platform",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-8 border-b pb-6">
          <Logo variant="mark" size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">EduBridge Terms of Service</h1>
            <p className="text-sm text-slate-500">Effective Date: January 1, 2026 | Last Updated: September 11, 2026</p>
          </div>
        </div>

        <div className="space-y-8 leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using EduBridge (&quot;the Platform&quot;), accessible at{" "}
              <Link href="https://edubridge-et.vercel.app" className="text-blue-600 hover:underline">
                https://edubridge-et.vercel.app
              </Link>
              , you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Services</h2>
            <p>
              EduBridge provides a cloud-based educational management, curriculum learning intelligence, and assessment platform for educational institutions, teachers, and students. Services include student management, assignment distribution, exam preparation, and performance analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. User Accounts and Authentication</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Users may register via institutional invitations or Google OAuth authentication.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</li>
              <li>You agree to notify EduBridge immediately upon discovering any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Acceptable Use Policy</h2>
            <p className="mb-2">Users agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the platform for any unlawful purpose or to distribute prohibited content.</li>
              <li>Attempt to gain unauthorized access to other tenants&apos; data or disrupt the infrastructure.</li>
              <li>Upload malicious code, viruses, or harmful scripts.</li>
              <li>Reverse engineer or decompile any part of the EduBridge platform software.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Intellectual Property</h2>
            <p>
              EduBridge and its original content, features, and functionality remain the exclusive property of EduBridge. School-specific curriculum and assessment materials uploaded by educational institutions remain the property of their respective creators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms of Service or engage in malicious activity that threatens platform security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Contact Us</h2>
            <p>
              For legal inquiries or questions regarding these terms, please contact:{" "}
              <a href="mailto:edubridge.et@gmail.com" className="text-blue-600 hover:underline font-medium">
                edubridge.et@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
