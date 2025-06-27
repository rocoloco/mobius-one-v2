import { Card, CardBody, CardHeader, Button, Accordion, AccordionItem, Chip } from "@heroui/react";
import { 
  HelpCircle, 
  Book, 
  Zap, 
  Database, 
  MessageSquare,
  ExternalLink,
  Play,
  Code,
  Settings,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HelpPage() {
  const navigate = useNavigate();

  const quickStartSteps = [
    { title: "Connect Your Systems", description: "Set up Salesforce and NetSuite connections", action: () => navigate('/settings') },
    { title: "Start a Query", description: "Ask questions about your business data", action: () => navigate('/query') },
    { title: "Review Dashboard", description: "Monitor system status and activity", action: () => navigate('/dashboard') },
    { title: "Explore History", description: "View and manage past conversations", action: () => navigate('/history') }
  ];

  const exampleQueries = [
    "Show me the top 5 opportunities in Salesforce this quarter",
    "What's our revenue growth compared to last year?",
    "List all accounts with deals over $100,000",
    "Get me a summary of our financial performance",
    "Show me recent customer activity in NetSuite",
    "What are our best performing products this month?"
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <HelpCircle className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-mono font-bold text-gray-900">
            HELP & DOCUMENTATION
          </h1>
          <p className="text-gray-600 font-mono">Get started with AI Terminal</p>
        </div>
      </div>

      {/* Quick Start Guide */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <h3 className="font-mono font-bold text-lg flex items-center">
            <Zap className="mr-2" size={18} />
            QUICK START GUIDE
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {quickStartSteps.map((step, index) => (
              <Card key={index} className="bg-gray-50 border border-gray-200">
                <CardBody className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-mono font-bold">
                          {index + 1}
                        </div>
                        <h4 className="font-mono font-bold text-sm">{step.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 font-mono mb-3">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    className="font-mono w-full"
                    onClick={step.action}
                    endContent={<Play size={14} />}
                  >
                    GO TO {step.title.toUpperCase()}
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Example Queries */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <h3 className="font-mono font-bold text-lg flex items-center">
            <MessageSquare className="mr-2" size={18} />
            EXAMPLE QUERIES
          </h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600 font-mono mb-4">
            Try these sample queries to get started with AI Terminal:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {exampleQueries.map((query, index) => (
              <Card key={index} className="bg-blue-50 border border-blue-200">
                <CardBody className="p-3">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-mono text-blue-800 flex-1">
                      "{query}"
                    </p>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      isIconOnly
                      className="ml-2 flex-shrink-0"
                      onClick={() => navigate(`/query?q=${encodeURIComponent(query)}`)}
                    >
                      <Play size={12} />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* FAQ Section */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <h3 className="font-mono font-bold text-lg flex items-center">
            <Book className="mr-2" size={18} />
            FREQUENTLY ASKED QUESTIONS
          </h3>
        </CardHeader>
        <CardBody>
          <Accordion className="font-mono">
            <AccordionItem key="1" aria-label="What is AI Terminal?" title="What is AI Terminal?">
              <p className="text-sm text-gray-600">
                AI Terminal is an intelligent business assistant that integrates with your Salesforce CRM and NetSuite ERP systems. 
                It allows you to query your business data using natural language and get AI-powered insights and recommendations.
              </p>
            </AccordionItem>
            
            <AccordionItem key="2" aria-label="How do I connect my systems?" title="How do I connect my systems?">
              <p className="text-sm text-gray-600">
                Go to the Settings page to configure your Salesforce and NetSuite connections. You'll need your API credentials 
                and authentication tokens. Once connected, you can test the connections to ensure they're working properly.
              </p>
            </AccordionItem>
            
            <AccordionItem key="3" aria-label="What types of queries can I ask?" title="What types of queries can I ask?">
              <p className="text-sm text-gray-600">
                You can ask about sales opportunities, revenue data, customer information, financial metrics, and more. 
                The AI understands natural language, so you can ask questions like "Show me top deals this quarter" or 
                "What's our revenue growth rate?"
              </p>
            </AccordionItem>
            
            <AccordionItem key="4" aria-label="Is my data secure?" title="Is my data secure?">
              <p className="text-sm text-gray-600">
                Yes, all data transmissions are encrypted and we follow industry best practices for security. 
                Your API credentials are stored securely and we only access the data you explicitly grant permission for.
              </p>
            </AccordionItem>
            
            <AccordionItem key="5" aria-label="Can I export my conversations?" title="Can I export my conversations?">
              <p className="text-sm text-gray-600">
                Yes, you can export individual conversations or all your session history from the History page. 
                Supported formats include JSON, CSV, and PDF for easy sharing and archiving.
              </p>
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>

      {/* System Requirements */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <h3 className="font-mono font-bold text-lg flex items-center">
            <Settings className="mr-2" size={18} />
            SYSTEM REQUIREMENTS
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-mono font-bold text-sm mb-3 flex items-center">
                <Database className="mr-2" size={14} />
                SALESFORCE INTEGRATION
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 font-mono">
                <li>• Salesforce API access enabled</li>
                <li>• Valid access token or OAuth credentials</li>
                <li>• Read permissions for Opportunities, Accounts, Leads</li>
                <li>• API version 50.0 or higher recommended</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono font-bold text-sm mb-3 flex items-center">
                <Database className="mr-2" size={14} />
                NETSUITE INTEGRATION
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 font-mono">
                <li>• NetSuite SuiteScript access</li>
                <li>• RESTlet or SuiteTalk API enabled</li>
                <li>• Financial data read permissions</li>
                <li>• Token-based authentication configured</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Support & Resources */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
        <CardBody className="p-6">
          <div className="text-center">
            <h3 className="font-mono font-bold text-lg text-blue-900 mb-2">
              NEED MORE HELP?
            </h3>
            <p className="text-blue-800 font-mono mb-4">
              Explore additional resources and documentation
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="flat"
                color="primary"
                className="font-mono"
                startContent={<Book size={16} />}
                endContent={<ExternalLink size={16} />}
              >
                API DOCUMENTATION
              </Button>
              <Button
                variant="flat"
                color="primary"
                className="font-mono"
                startContent={<Search size={16} />}
                onClick={() => navigate('/query')}
              >
                START QUERYING
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}