import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, MessageSquare, Database, BarChart3, Settings, 
  ExternalLink, ChevronDown, ChevronRight, Book, 
  HelpCircle, MessageCircle, Phone, Mail, Globe
} from "lucide-react";
import ProfileMenu from "@/components/layout/ProfileMenu";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const quickActions = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using Mobius One for business intelligence",
      icon: Book,
      link: "#getting-started"
    },
    {
      title: "Connect Your Systems",
      description: "Step-by-step guide to integrate Salesforce and NetSuite",
      icon: Database,
      link: "/settings"
    },
    {
      title: "Query Examples",
      description: "Sample questions to get insights from your business data",
      icon: MessageSquare,
      link: "#examples"
    },
    {
      title: "API Documentation",
      description: "Technical reference for developers and integrations",
      icon: Settings,
      link: "#api-docs"
    }
  ];

  const faqItems = [
    {
      question: "How do I connect my Salesforce account?",
      answer: "Go to Settings > System Connections and click 'Configure' next to Salesforce. You'll need your Salesforce instance URL, username, password, and security token. Our system uses OAuth 2.0 for secure authentication."
    },
    {
      question: "What types of questions can I ask?",
      answer: "You can ask about sales data, financial metrics, customer information, pipeline analysis, revenue trends, and cross-system comparisons. For example: 'Show me Q4 revenue by region' or 'Which deals are at risk this month?'"
    },
    {
      question: "How accurate are the AI responses?",
      answer: "Our AI provides confidence scores with each response. Responses typically achieve 90%+ accuracy when your systems are properly connected and data is current. Sources are always cited so you can verify information."
    },
    {
      question: "Can I export the data and insights?",
      answer: "Yes, you can export conversations, reports, and data visualizations in multiple formats including PDF, CSV, and JSON. Use the export buttons in the query interface or schedule automated reports."
    },
    {
      question: "Is my business data secure?",
      answer: "Absolutely. We use bank-level encryption, role-based access controls, and SOC 2 compliance. Your data never leaves your secure environment and all connections use encrypted channels."
    },
    {
      question: "How do I schedule regular reports?",
      answer: "In the query interface, after getting results you want to track, click 'Schedule' and choose your frequency (daily, weekly, monthly). Reports will be automatically generated and sent to your email."
    },
    {
      question: "What happens if a system connection fails?",
      answer: "You'll receive immediate notifications about connection issues. The system will attempt automatic reconnection, and you can manually test connections in Settings. Historical data remains accessible during outages."
    },
    {
      question: "Can multiple team members use the same account?",
      answer: "Yes, Mobius One supports team collaboration with role-based permissions. Admins can invite users, set access levels, and manage system connections for the entire organization."
    }
  ];

  const examples = [
    {
      category: "Sales & Revenue",
      queries: [
        "Show me this quarter's revenue vs last quarter",
        "Which sales reps are performing above target?",
        "What's our average deal size this month?",
        "List opportunities closing in the next 30 days"
      ]
    },
    {
      category: "Financial Analysis",
      queries: [
        "What's our current cash flow position?",
        "Show accounts receivable aging report",
        "Compare expenses vs budget by department",
        "What's our customer acquisition cost?"
      ]
    },
    {
      category: "Customer Insights",
      queries: [
        "Who are our top 10 customers by revenue?",
        "Which customers haven't ordered in 90 days?",
        "What's our customer churn rate?",
        "Show customer satisfaction scores by region"
      ]
    },
    {
      category: "Operational Metrics",
      queries: [
        "How many support tickets are open?",
        "What's our average response time?",
        "Show inventory levels by product category",
        "Which products have the highest margins?"
      ]
    }
  ];

  const filteredFaq = faqItems.filter(item =>
    searchQuery === "" || 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white" style={{position: 'relative'}}>
      {/* Profile Menu */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        zIndex: 1000
      }}>
        <ProfileMenu />
      </div>
      
      <div className="p-6" style={{paddingRight: '120px'}}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Help Center</h1>
          <p className="text-gray-600">Find answers, learn best practices, and get the most out of Mobius One</p>
        </div>

        {/* Search */}
        <div className="card p-6 mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              placeholder="Search help articles, FAQs, and documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern pl-12 h-12 text-base w-full"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link} className="card-hover p-6 group">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <action.icon className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Query Examples */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Example Questions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {examples.map((category, index) => (
              <div key={index} className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">{category.category}</h3>
                <div className="space-y-3">
                  {category.queries.map((query, queryIndex) => (
                    <div key={queryIndex} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                      <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{query}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFaq.map((faq, index) => (
              <div key={index} className="card">
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <p className="text-gray-600 pt-4 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Book className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete technical documentation and integration guides
              </p>
              <button className="btn-secondary text-sm">
                View Docs
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            <div className="card p-6">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Best Practices</h3>
              <p className="text-sm text-gray-600 mb-4">
                Tips and strategies for getting the most out of your data
              </p>
              <button className="btn-secondary text-sm">
                Learn More
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            <div className="card p-6">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">System Status</h3>
              <p className="text-sm text-gray-600 mb-4">
                Check real-time status of all Mobius One services
              </p>
              <button className="btn-secondary text-sm">
                View Status
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="card p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our support team is here to help you succeed with Mobius One. Get personalized assistance for your specific use case.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chat with our support team in real-time
                </p>
                <button className="btn-primary text-sm">Start Chat</button>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Send us a detailed message about your issue
                </p>
                <button className="btn-secondary text-sm">Send Email</button>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Phone Support</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Speak directly with a support specialist
                </p>
                <button className="btn-secondary text-sm">Call Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}