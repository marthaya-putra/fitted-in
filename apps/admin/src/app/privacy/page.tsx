import { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - FittedIn",
  description: "Privacy policy for FittedIn Chrome Extension",
};

export default function PrivacyPolicy() {
  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Privacy Policy
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-[52px]">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-sm p-8">
        <div className="prose prose-sm prose-gray max-w-none space-y-6">
          <p className="text-muted-foreground">
            This Privacy Policy describes how FittedIn (&quot;we,&quot; &quot;our,&quot; or
            &quot;us&quot;) collects, uses, and protects your information when you use
            our Chrome extension.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Information We Collect
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-foreground text-sm">
                  1.1 Job Information
                </h3>
                <p className="text-muted-foreground text-sm">
                  When you visit LinkedIn job pages, the extension automatically extracts:
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
                  <li>Job descriptions from LinkedIn job postings</li>
                  <li>Company names and job titles</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-foreground text-sm">
                  1.2 No Personal Data Collection
                </h3>
                <p className="text-muted-foreground text-sm">
                  We do <strong>NOT</strong> collect:
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
                  <li>Personal identifiers (name, email, phone number)</li>
                  <li>Login credentials or passwords</li>
                  <li>Browsing history outside of LinkedIn job pages</li>
                  <li>Personal messages or private communications</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground text-sm">
              We use the collected job information solely for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
              <li>Optimizing your resume to match specific job requirements</li>
              <li>Providing personalized resume recommendations</li>
              <li>Improving our resume optimization service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. Data Storage and Security
            </h2>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                <strong className="text-foreground">Local Storage:</strong> All data is processed locally
                in your browser and temporarily stored during the optimization process.
              </p>
              <p className="text-muted-foreground text-sm">
                <strong className="text-foreground">API Communication:</strong> Job descriptions are sent
                to our secure servers for resume optimization and are not permanently stored.
              </p>
              <p className="text-muted-foreground text-sm">
                <strong className="text-foreground">Security:</strong> We implement industry-standard
                security measures to protect your data during transmission.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Data Sharing and Third Parties
            </h2>
            <p className="text-muted-foreground text-sm">
              We do <strong>NOT</strong> sell, trade, or share your information with third parties
              for marketing purposes. Job information is only shared with our resume optimization
              service to provide you with personalized recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. User Rights and Control
            </h2>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                <strong className="text-foreground">Control:</strong> You have complete control over the extension:
              </p>
              <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
                <li>Disable the extension at any time through Chrome extensions settings</li>
                <li>Clear locally stored data by clearing browser data</li>
                <li>Uninstall the extension completely</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                <strong className="text-foreground">Access:</strong> Since we don&apos;t store personal data,
                there&apos;s no personal information to access or delete.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. Chrome Extension Permissions
            </h2>
            <p className="text-muted-foreground text-sm">
              Our extension requests the following minimum permissions:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
              <li><strong className="text-foreground">activeTab:</strong> Access the current tab to extract job information</li>
              <li><strong className="text-foreground">sidePanel:</strong> Display the optimization interface</li>
              <li><strong className="text-foreground">scripting:</strong> Extract job description content from LinkedIn pages</li>
              <li><strong className="text-foreground">webNavigation:</strong> Detect when you&apos;re on a LinkedIn job page</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Data Retention
            </h2>
            <p className="text-muted-foreground text-sm">
              Job descriptions are processed for optimization and are not permanently stored on our servers.
              Temporary data during processing is automatically deleted within 24 hours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Contact Us
            </h2>
            <p className="text-muted-foreground text-sm">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-muted-foreground text-sm">
                <strong className="text-foreground">Email:</strong> marthayaputra.han@gmail.com
              </p>
              <p className="text-muted-foreground text-sm">
                <strong className="text-foreground">Extension:</strong> FittedIn Chrome Extension
              </p>
            </div>
          </section>

          <div className="border-t pt-6 mt-8">
            <p className="text-xs text-muted-foreground text-center">
              This privacy policy is designed to comply with the Chrome Web Store Developer Program Policies and applicable privacy laws.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
