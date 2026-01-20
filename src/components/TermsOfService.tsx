import { Grid2X2, ChevronLeftIcon } from 'lucide-react';
import { Button } from './ui/button';

export default function TermsOfService() {
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
          <h2 className="text-3xl font-bold mb-2">Terms of Service</h2>
          <p className="text-muted-foreground">Last updated: January 20, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Productivity Hub ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">2. Description of Service</h3>
            <p className="text-muted-foreground leading-relaxed">
              Productivity Hub is a productivity management platform that allows users to organize tasks, track habits, and manage events. The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue any aspect of the Service at any time.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">3. User Accounts</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept all responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">4. User Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              You retain all rights to the content you create, upload, or share through the Service (tasks, habits, events, etc.). By using the Service, you grant us a license to store, process, and display your content solely for the purpose of providing the Service to you.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">5. Acceptable Use</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to the Service or related systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use the Service to transmit any harmful code or malware</li>
              <li>Impersonate any person or entity</li>
              <li>Collect or store personal data about other users without consent</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">6. Intellectual Property</h3>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content, features, and functionality are owned by Productivity Hub and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">7. Termination</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">8. Disclaimer of Warranties</h3>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">9. Limitation of Liability</h3>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall Productivity Hub, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">10. Changes to Terms</h3>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">11. Contact Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at support@productivityhub.com
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="/privacy-policy" className="hover:text-foreground underline">
              Privacy Policy
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
