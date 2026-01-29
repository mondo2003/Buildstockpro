import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Gavel, AlertCircle, Mail } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">
              Terms of Service
            </h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Welcome to BuildStop Pro (&quot;Platform&quot;). These Terms of Service (&quot;Terms&quot;) govern your use of
              our sustainable building materials search and reservation platform. By accessing or using the Platform, you agree
              to be bound by these Terms.
            </p>
            <p>
              If you do not agree with these Terms, please do not use the Platform.
            </p>
          </CardContent>
        </Card>

        {/* Account Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Account Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Creating an Account</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must notify us of unauthorised use immediately</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Account Responsibilities</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>You are solely responsible for activity under your account</li>
                <li>You must not share your password with others</li>
                <li>You may not use another user&apos;s account without permission</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Acceptable Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>You agree not to use the Platform to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code or viruses</li>
              <li>Spam, harass, or harm other users</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Use the platform for fraudulent purposes</li>
              <li>Interfere with or disrupt the platform&apos;s functionality</li>
            </ul>
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Product Information & Reservations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              The Platform provides information about building materials from various merchants. While we strive for accuracy,
              we cannot guarantee:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Real-time inventory accuracy</li>
              <li>Product availability at time of pickup</li>
              <li>Pricing accuracy (subject to merchant verification)</li>
              <li>Carbon footprint calculations (estimates only)</li>
            </ul>
            <p className="mt-3">
              Product reservations are not confirmed until you visit the merchant and complete the purchase in person.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              To the fullest extent permitted by law, BuildStop Pro shall not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Any indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Product quality or merchant conduct</li>
              <li>Errors or inaccuracies in product information</li>
              <li>Unavailable products or cancelled reservations</li>
            </ul>
            <p className="mt-3">
              Our total liability shall not exceed the amount you paid, if any, to use the Platform.
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              The Platform and its original content, features, and functionality are owned by BuildStop Pro and are
              protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, modify, create derivative works, or publicly display our content without our
              prior written consent.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              We reserve the right to suspend or terminate your account at any time for:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Violation of these Terms</li>
              <li>Suspicious or fraudulent activity</li>
              <li>Extended period of inactivity</li>
              <li>At our sole discretion</li>
            </ul>
            <p className="mt-3">
              Upon termination, your right to use the Platform will immediately cease.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Changes to These Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              We may update these Terms from time to time. We will notify you of material changes by:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Posting the new Terms on the Platform</li>
              <li>Sending an email notification</li>
              <li>In-app notification</li>
            </ul>
            <p className="mt-3">
              Continued use of the Platform after changes constitutes acceptance of the new Terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <ul className="list-none space-y-1 ml-4">
              <li>• Email: legal@buildstoppro.com</li>
              <li>• Address: BuildStop Pro, United Kingdom</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
