import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Phone, 
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Send
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

const Support = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [ticket, setTicket] = useState<SupportTicket>({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I connect my Gmail account?',
      answer: 'To connect your Gmail account, go to Settings > Integrations and click "Connect Google". You\'ll be redirected to Google\'s authorization page where you can grant permission for RelationshipOS to access your Gmail data.',
      category: 'setup',
    },
    {
      id: '2',
      question: 'What data does RelationshipOS access from my Google account?',
      answer: 'We only access email metadata (sender, recipient, timestamps, subject lines) and calendar events. We do not read the content of your emails. All data is encrypted and stored securely.',
      category: 'privacy',
    },
    {
      id: '3',
      question: 'How does the AI Oracle work?',
      answer: 'The AI Oracle analyzes your communication patterns, meeting history, and relationship data to provide intelligent insights and recommendations. It uses machine learning to identify trends and suggest actions to strengthen your professional relationships.',
      category: 'features',
    },
    {
      id: '4',
      question: 'Can I export my data?',
      answer: 'Yes, you can export all your data at any time through Settings > Data Export. You\'ll receive a comprehensive file containing all your contacts, interactions, and relationship data.',
      category: 'data',
    },
    {
      id: '5',
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription at any time through Settings > Billing or by clicking "Manage Subscription" in your account dashboard. Your access will continue until the end of your current billing period.',
      category: 'billing',
    },
    {
      id: '6',
      question: 'Is my data secure?',
      answer: 'Absolutely. We use industry-standard encryption, comply with SOC 2 standards, and never sell your data to third parties. All data is stored securely on encrypted servers.',
      category: 'privacy',
    },
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmitTicket = async () => {
    if (!ticket.name || !ticket.email || !ticket.subject || !ticket.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // In a real app, this would submit to your support system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Ticket Submitted",
        description: "We've received your message and will respond within 24 hours.",
      });

      // Reset form
      setTicket({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit support ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Support Center</h1>
          <p className="text-muted-foreground">
            Find answers to common questions or get in touch with our team
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-medium transition-shadow">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Live Chat</h3>
            <p className="text-sm text-muted-foreground">
              Get instant help from our support team
            </p>
            <Badge variant="outline" className="text-xs">
              Available 9 AM - 5 PM PST
            </Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-medium transition-shadow">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Email Support</h3>
            <p className="text-sm text-muted-foreground">
              Send us a detailed message
            </p>
            <Badge variant="outline" className="text-xs">
              Response within 24 hours
            </Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-medium transition-shadow">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <ExternalLink className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Knowledge Base</h3>
            <p className="text-sm text-muted-foreground">
              Browse our comprehensive guides
            </p>
            <Badge variant="outline" className="text-xs">
              Self-service help
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search frequently asked questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ List */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to the most common questions about RelationshipOS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredFAQs.map((faq) => (
                <Collapsible
                  key={faq.id}
                  open={openItems.includes(faq.id)}
                  onOpenChange={() => toggleItem(faq.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto text-left border rounded-lg hover:bg-accent"
                    >
                      <span className="font-medium">{faq.question}</span>
                      {openItems.includes(faq.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-2">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              ))}

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No FAQs found matching your search. Try different keywords or{' '}
                    <Button variant="link" className="h-auto p-0" onClick={() => setSearchTerm('')}>
                      clear your search
                    </Button>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message and we'll help you out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={ticket.name}
                    onChange={(e) => setTicket(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={ticket.email}
                    onChange={(e) => setTicket(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={ticket.subject}
                  onChange={(e) => setTicket(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((priority) => (
                    <Button
                      key={priority}
                      variant={ticket.priority === priority ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTicket(prev => ({ ...prev, priority }))}
                      className={ticket.priority === priority ? getPriorityColor(priority) : ''}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={ticket.message}
                  onChange={(e) => setTicket(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please describe your issue in detail..."
                  className="min-h-[120px]"
                />
              </div>

              <Button
                onClick={handleSubmitTicket}
                disabled={submitting}
                className="w-full bg-gradient-primary"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Support Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;