import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Cookie, User, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">
              Privacy Policy
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
              BuildStop Pro (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
              sustainable building materials platform.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy,
              please do not access the platform.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Name and contact details (email, phone number)</li>
                <li>Account credentials (username, password)</li>
                <li>Profile information (company name, preferences)</li>
                <li>Location information (with your consent)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Usage Information</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Search queries and browsing history</li>
                <li>Products viewed and searches performed</li>
                <li>Device information and IP address</li>
                <li>Cookie data and analytics information</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to comments, questions, and customer service requests</li>
              <li>Monitor and analyse trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Personalise your experience and deliver relevant content</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              We implement appropriate technical and organisational security measures to protect your personal information
              against unauthorised or unlawful processing, accidental loss, destruction, or damage.
            </p>
            <p>
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to
              use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Cookies and Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information.
              Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your personal information</li>
              <li>Objection to processing of your personal information</li>
              <li>Data portability</li>
              <li>Withdrawal of consent</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, please contact us at privacy@buildstoppro.com
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none space-y-1 ml-4">
              <li>• Email: privacy@buildstoppro.com</li>
              <li>• Address: BuildStop Pro, United Kingdom</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
