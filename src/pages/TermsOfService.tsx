import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>RelationshipOS Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using RelationshipOS, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                RelationshipOS is an AI-powered relationship management platform that helps you organize, track, and enhance your professional 
                relationships through integration with Gmail, Calendar, and other productivity tools.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Privacy and Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We take your privacy seriously. Your data is encrypted and stored securely. We only access your Gmail and Calendar data 
                with your explicit permission and use it solely to provide our relationship management services. We do not sell your data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Subscription and Billing</h2>
              <p className="text-muted-foreground leading-relaxed">
                RelationshipOS offers various subscription plans. You will be billed according to your chosen plan. You may cancel your 
                subscription at any time through your account settings or by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to use RelationshipOS only for lawful purposes and in accordance with these Terms. You may not use the service 
                to spam, harass, or engage in any activity that could harm others or violate their privacy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                RelationshipOS is provided "as is" without any representations or warranties. We shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through 
                the application interface.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at support@relationshipos.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;