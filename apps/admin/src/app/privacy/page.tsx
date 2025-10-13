import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - FittedIn",
  description: "Privacy policy for FittedIn Chrome Extension",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Last Updated: {new Date().toLocaleDateString()}
              </h2>
              <p className="text-gray-600">
                This Privacy Policy describes how FittedIn ("we," "our," or
                "us") collects, uses, and protects your information when you use
                our Chrome extension.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                1. Information We Collect
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-700">
                    1.1 Job Information
                  </h3>
                  <p className="text-gray-600">
                    When you visit LinkedIn job pages, the extension
                    automatically extracts:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>Job descriptions from LinkedIn job postings</li>
                    <li>Company names and job titles</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">
                    1.2 No Personal Data Collection
                  </h3>
                  <p className="text-gray-600">
                    We do <strong>NOT</strong> collect:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>Personal identifiers (name, email, phone number)</li>
                    <li>Login credentials or passwords</li>
                    <li>Browsing history outside of LinkedIn job pages</li>
                    <li>Personal messages or private communications</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-600">
                We use the collected job information solely for:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>
                  Optimizing your resume to match specific job requirements
                </li>
                <li>Providing personalized resume recommendations</li>
                <li>Improving our resume optimization service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                3. Data Storage and Security
              </h2>
              <div className="space-y-3">
                <p className="text-gray-600">
                  <strong>Local Storage:</strong> All data is processed locally
                  in your browser and temporarily stored during the optimization
                  process.
                </p>
                <p className="text-gray-600">
                  <strong>API Communication:</strong> Job descriptions are sent
                  to our secure servers for resume optimization and are not
                  permanently stored.
                </p>
                <p className="text-gray-600">
                  <strong>Security:</strong> We implement industry-standard
                  security measures to protect your data during transmission.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                4. Data Sharing and Third Parties
              </h2>
              <p className="text-gray-600">
                We do <strong>NOT</strong> sell, trade, or share your
                information with third parties for marketing purposes. Job
                information is only shared with our resume optimization service
                to provide you with personalized recommendations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                5. User Rights and Control
              </h2>
              <div className="space-y-3">
                <p className="text-gray-600">
                  <strong>Control:</strong> You have complete control over the
                  extension:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  <li>
                    Disable the extension at any time through Chrome extensions
                    settings
                  </li>
                  <li>Clear locally stored data by clearing browser data</li>
                  <li>Uninstall the extension completely</li>
                </ul>
                <p className="text-gray-600">
                  <strong>Access:</strong> Since we don't store personal data,
                  there's no personal information to access or delete.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                6. Chrome Extension Permissions
              </h2>
              <p className="text-gray-600">
                Our extension requests the following minimum permissions:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>
                  <strong>activeTab:</strong> Access the current tab to extract
                  job information
                </li>
                <li>
                  <strong>sidePanel:</strong> Display the optimization interface
                </li>
                <li>
                  <strong>scripting:</strong> Extract job description content
                  from LinkedIn pages
                </li>
                <li>
                  <strong>webNavigation:</strong> Detect when you're on a
                  LinkedIn job page
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                7. Data Retention
              </h2>
              <p className="text-gray-600">
                Job descriptions are processed for optimization and are not
                permanently stored on our servers. Temporary data during
                processing is automatically deleted within 24 hours.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                8. Children's Privacy
              </h2>
              <p className="text-gray-600">
                Our service is not intended for children under 13. We do not
                knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                9. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-600">
                We may update this privacy policy from time to time. We will
                notify users of any changes by updating the date at the top of
                this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                10. Contact Us
              </h2>
              <p className="text-gray-600">
                If you have questions about this Privacy Policy, please contact
                us at:
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-gray-600">
                  <strong>Email:</strong> marthayaputra.han@gmail.com
                </p>
                <p className="text-gray-600">
                  <strong>Extension:</strong> FittedIn Chrome Extension
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500 text-center">
                This privacy policy is designed to comply with the Chrome Web
                Store Developer Program Policies and applicable privacy laws.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
