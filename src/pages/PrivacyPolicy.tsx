import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              RelationshipOS Privacy Policy
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                1. Information We Collect
              </h2>
              <div className="space-y-3">
                <h3 className="font-medium">Personal Information:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Name, email address, and profile information from your Google account</li>
                  <li>Contact information you choose to import or add manually</li>
                  <li>Communication preferences and settings</li>
                </ul>
                
                <h3 className="font-medium">Google Data:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Email metadata (sender, recipient, timestamps, subject lines)</li>
                  <li>Calendar events and meeting information</li>
                  <li>Contact information from Google Contacts (with permission)</li>
                </ul>

                <h3 className="font-medium">Usage Data:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>How you interact with our platform</li>
                  <li>Feature usage and preferences</li>
                  <li>Performance and error logs</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                2. How We Use Your Information
              </h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  We use your information to provide and improve our relationship management services:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Analyze your communication patterns to provide relationship insights</li>
                  <li>Generate AI-powered recommendations for maintaining relationships</li>
                  <li>Identify opportunities for follow-ups and networking</li>
                  <li>Provide personalized dashboard and analytics</li>
                  <li>Send you important updates about your account or our service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Security</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>End-to-end encryption for data transmission</li>
                  <li>Encrypted storage of all sensitive information</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Compliance with SOC 2 and other security standards</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal data. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>With your explicit consent</li>
                <li>With service providers who help us operate our platform (under strict confidentiality agreements)</li>
                <li>When required by law or to protect our rights and safety</li>
                <li>In connection with a business transfer (with prior notice to users)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Access: Request a copy of your personal data</li>
                <li>Correction: Update or correct your information</li>
                <li>Deletion: Request deletion of your account and data</li>
                <li>Portability: Export your data in a machine-readable format</li>
                <li>Opt-out: Unsubscribe from marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Google API Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">
                RelationshipOS's use and transfer of information received from Google APIs adheres to the 
                <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Google API Services User Data Policy
                </a>, including the Limited Use requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg mt-3">
                <p className="font-medium">Email: privacy@relationshipos.com</p>
                <p className="font-medium">Address: [Your Business Address]</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;