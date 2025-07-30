// app/privacy/page.tsx
"use client"

import React from "react"

export default function PrivacyPage() {
  return (
    <div className="mx-auto h-screen max-w-4xl overflow-y-auto bg-white p-8 text-slate-800">
      <h1 className="mb-6 text-center text-3xl font-bold">Privacy Policy</h1>

      <section className="space-y-6 text-sm leading-6">
        <div>
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            Agilemove (developer of product CoWrkr.ai.) (“we,” “us,” or “our”)
            is committed to protecting the privacy of individuals who interact
            with our services, including website visitors, customers, and users.
            This Privacy Policy outlines how we collect, use, disclose, and
            safeguard your personal information. By accessing or using our
            website and services, you agree to the terms outlined in this
            policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. Information We Collect</h2>
          <p>
            We collect personal information to provide and improve our services.
            The types of information we collect include:
          </p>
          <ul className="mt-2 list-disc pl-6">
            <li>
              <strong>Information You Provide Voluntarily:</strong> When you
              sign up for our services or interact with us (e.g., requesting
              demos, attending events), we may collect personal details such as
              your name, work email address, job title, telephone number, and
              any other information you choose to provide.
            </li>
            <li>
              <strong>Information Collected Automatically:</strong> We
              automatically collect non-identifying information when you visit
              our website or use our services. This may include your IP address,
              browser type, operating system, referring URLs, and other
              technical data. This information is used for statistical purposes
              to improve our services and generally does not identify you
              personally.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            3. How We Use Your Information
          </h2>
          <ul className="mt-2 list-disc pl-6">
            <li>To Provide and Maintain Our Services</li>
            <li>To Improve Our Services</li>
            <li>To Communicate with You</li>
            <li>For Marketing Purposes</li>
            <li>To Enforce Our Terms and Policies</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            4. Legal Basis for Processing Personal Information
          </h2>
          <ul className="mt-2 list-disc pl-6">
            <li>To Fulfill a Contract</li>
            <li>With Your Consent</li>
            <li>For Legitimate Interests</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            5. Sharing Your Personal Information
          </h2>
          <ul className="mt-2 list-disc pl-6">
            <li>With Service Providers</li>
            <li>For Legal Reasons</li>
            <li>With Your Consent</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information from unauthorized access,
            disclosure, alteration, or destruction. However, no method of
            transmission over the internet or electronic storage is completely
            secure, and we cannot guarantee absolute security.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">7. Data Retention</h2>
          <p>
            We retain your personal information only for as long as necessary to
            fulfill the purposes outlined in this Privacy Policy, unless a
            longer retention period is required or permitted by law.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            8. Your Data Protection Rights
          </h2>
          <ul className="mt-2 list-disc pl-6">
            <li>Access</li>
            <li>Correction</li>
            <li>Deletion</li>
            <li>Objection</li>
            <li>Restriction</li>
            <li>Data Portability</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, please contact us using the information
            provided in the “Contact Us” section below. We will respond to your
            request in accordance with applicable data protection laws.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            9. International Data Transfers
          </h2>
          <p>
            Your personal information may be transferred to, and processed in,
            countries other than the country in which you are resident. These
            countries may have data protection laws that are different from
            those of your country. We ensure that appropriate safeguards are in
            place to protect your information in accordance with this Privacy
            Policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">10. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under the age of 16. We
            do not knowingly collect personal information from children under
            16. If we become aware that we have collected personal information
            from a child under 16, we will take steps to delete such information
            promptly.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            11. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or for other operational, legal, or
            regulatory reasons. We will notify you of any material changes by
            posting the new Privacy Policy on our website and updating the “Last
            Revised” date at the top of this policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">12. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or
            our data practices, please contact us at:
          </p>
          <p className="mt-1">
            <strong>Agilemove Inc</strong>
            <br />
            Email:{" "}
            <a href="mailto:cowrkr@theagilemove.com" className="text-blue-500">
              cowrkr@theagilemove.com
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
