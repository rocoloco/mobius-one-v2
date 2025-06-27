import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import { 
  Bot, 
  Database, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  Play,
  Terminal
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-6">
            <Terminal className="text-white" size={32} />
          </div>
          <h1 className="text-5xl font-mono font-bold text-gray-900 mb-4">
            AI TERMINAL
          </h1>
          <p className="text-xl text-gray-600 font-mono mb-8 max-w-2xl mx-auto">
            Your intelligent business assistant for Salesforce CRM and NetSuite ERP integration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-mono"
              onClick={() => navigate('/query')}
              endContent={<ArrowRight size={18} />}
            >
              START QUERYING
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="font-mono border-gray-300"
              onClick={() => navigate('/dashboard')}
              endContent={<Play size={18} />}
            >
              VIEW DASHBOARD
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white border border-gray-200 hover:border-orange-300 transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="text-blue-600" size={20} />
                </div>
                <h3 className="font-mono font-bold text-lg">CRM INTEGRATION</h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 font-mono text-sm">
                Direct access to Salesforce opportunities, accounts, and pipeline data
              </p>
            </CardBody>
          </Card>

          <Card className="bg-white border border-gray-200 hover:border-orange-300 transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <h3 className="font-mono font-bold text-lg">ERP ANALYTICS</h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 font-mono text-sm">
                Real-time NetSuite financial data and performance metrics
              </p>
            </CardBody>
          </Card>

          <Card className="bg-white border border-gray-200 hover:border-orange-300 transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bot className="text-purple-600" size={20} />
                </div>
                <h3 className="font-mono font-bold text-lg">AI INSIGHTS</h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 font-mono text-sm">
                Intelligent analysis and recommendations from your business data
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-mono font-bold text-green-800 mb-2">SYSTEM STATUS</h4>
                  <p className="text-green-700 font-mono text-sm">All systems operational</p>
                </div>
                <Chip color="success" variant="flat" className="font-mono">
                  ONLINE
                </Chip>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-mono font-bold text-blue-800 mb-2">QUICK START</h4>
                  <p className="text-blue-700 font-mono text-sm">Connect your systems to begin</p>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="font-mono"
                  onClick={() => navigate('/settings')}
                >
                  SETUP
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}