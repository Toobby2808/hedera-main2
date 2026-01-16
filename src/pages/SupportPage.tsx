import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  MessageCircle,
  HelpCircle,
  FileText,
  Phone,
  Mail,
  ChevronRight,
  Shield,
  AlertCircle,
  BookOpen,
  Send,
} from "lucide-react";
import BottomNav from "../components/common/BottomNav";
import PrimaryButton from "../components/common/PrimaryButton";

interface FAQItem {
  question: string;
  answer: string;
}

const SupportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const faqs: FAQItem[] = [
    {
      question: "How do I book a ride?",
      answer:
        'Go to the Home screen and tap "Book a Ride". Enter your pickup and drop-off locations, then browse available drivers and select one that suits you.',
    },
    {
      question: "How do rewards work?",
      answer:
        "You earn tokens for every completed ride, referrals, and other activities. These tokens can be tracked in the Rewards section and may be redeemable for benefits.",
    },
    {
      question: "What if my driver cancels?",
      answer:
        "If a driver cancels, you'll be notified immediately and can book another ride. We apologize for any inconvenience this may cause.",
    },
    {
      question: "How do I become a driver?",
      answer:
        "Register as a driver during signup, then complete your vehicle registration in your profile. Once approved, you can start accepting ride requests.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Yes, all payment information is encrypted and processed securely. We never store your complete payment details on our servers.",
    },
  ];

  const supportOptions = [
    {
      icon: Phone,
      title: "Call Us",
      subtitle: "Mon-Fri, 9am-5pm",
      action: () => window.open("tel:+1234567890"),
    },
    {
      icon: Mail,
      title: "Email Support",
      subtitle: "support@campusride.com",
      action: () => window.open("mailto:support@campusride.com"),
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      subtitle: "Chat with our team",
      action: () => {},
    },
  ];

  const quickLinks = [
    { icon: BookOpen, title: "User Guide", path: "#" },
    { icon: Shield, title: "Safety Guidelines", path: "#" },
    { icon: FileText, title: "Terms of Service", path: "#" },
    { icon: AlertCircle, title: "Report an Issue", path: "#" },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessageSent(true);
      setMessage("");
      setTimeout(() => setMessageSent(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-header px-5 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Help & Support</h1>
        </div>

        {/* Help Card */}
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-5 shadow-elevated">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <HelpCircle className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                How can we help?
              </h2>
              <p className="text-sm text-muted-foreground">
                We're here for you 24/7
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 -mt-4">
        {/* Contact Options */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-3">Contact Us</h3>
          <div className="space-y-2">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={index}
                  onClick={option.action}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">
                      {option.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {option.subtitle}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Message */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-3">Send a Message</h3>
          {messageSent ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <p className="text-foreground font-medium">Message Sent!</p>
              <p className="text-sm text-muted-foreground">
                We'll get back to you soon
              </p>
            </div>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                className="w-full h-24 bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <PrimaryButton
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="mt-3"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </PrimaryButton>
            </>
          )}
        </div>

        {/* FAQs */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-3">
            Frequently Asked Questions
          </h3>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border last:border-0">
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === index ? null : index)
                  }
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <span className="font-medium text-foreground pr-4">
                    {faq.question}
                  </span>
                  <ChevronRight
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedFAQ === index ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {expandedFAQ === index && (
                  <p className="text-sm text-muted-foreground pb-3 pr-8">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-3">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <button
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {link.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">SMS v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2025 SMS. All rights reserved.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default SupportPage;
