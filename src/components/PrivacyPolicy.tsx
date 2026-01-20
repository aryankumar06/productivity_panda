import { Grid2X2, ChevronLeftIcon } from 'lucide-react';
import { Button } from './ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <a href="/">
              <ChevronLeftIcon className="size-4 me-2" />
              Back to Login
            </a>
          </Button>
          <div className="flex items-center gap-2 mb-4">
            <Grid2X2 className="size-6" />
            <h1 className="text-2xl font-bold">Productivity Hub</h1>
          </div>
          <h2 className="text-3xl font-bold mb-2">Privacy Policy</h2>
          <p className="text-muted-foreground">Last updated: January 20, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3">1. Introduction</h3>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Productivity Hub. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">2. Information We Collect</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium mb-2">2.1 Personal Information</h4>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Email address</li>
                  <li>Password (encrypted)</li>
                  <li>Profile information (if provided)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-2">2.2 Usage Data</h4>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We automatically collect certain information when you use the Service:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Tasks, habits, and events you create</li>
                  <li>Usage patterns and preferences</li>
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">3. How We Use Your Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Personalize your experience</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">4. Data Storage and Security</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use Supabase as our backend service provider. Your data is:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Stored securely using industry-standard encryption</li>
              <li>Protected by authentication and authorization mechanisms</li>
              <li>Backed up regularly to prevent data loss</li>
              <li>Accessible only to authorized personnel</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">5. Data Sharing and Disclosure</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (e.g., Supabase for data storage)</li>
              <li><strong>Legal Requirements:</strong> If required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">6. Your Rights and Choices</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise these rights, please contact us at privacy@productivityhub.com
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">8. Data Retention</h3>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal data, unless we are required to retain it for legal purposes.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">9. Children's Privacy</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">10. International Data Transfers</h3>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and maintained on servers located outside of your country. By using the Service, you consent to the transfer of your information to countries that may have different data protection laws than your country of residence.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">11. Changes to This Privacy Policy</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">12. Contact Us</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul className="list-none text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Email: privacy@productivityhub.com</li>
              <li>Support: support@productivityhub.com</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="/terms-of-service" className="hover:text-foreground underline">
              Terms of Service
            </a>
            <span>•</span>
            <a href="/" className="hover:text-foreground underline">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
