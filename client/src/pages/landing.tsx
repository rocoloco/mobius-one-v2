import { useState, useEffect } from "react";
import { Button, Card, CardBody, CardHeader, Chip, Input, Avatar, Divider } from "@heroui/react";
import { ArrowRight, MessageSquare, BarChart3, Zap, Terminal, Play, Search, CheckCircle, AlertCircle, Clock, Database, TrendingUp, Users, DollarSign, Settings, ExternalLink, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function LandingPage() {
  const navigate = useNavigate();
  const [demoQuery, setDemoQuery] = useState("");
  const [showDemoResult, setShowDemoResult] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  const { data: systemConnections = [] } = useQuery({
    queryKey: ['/api/systems'],
    enabled: true
  });

  // Demo animation sequence
  useEffect(() => {
    if (showDemoResult) {
      const timer = setTimeout(() => {
        setAnimationStep(prev => prev < 3 ? prev + 1 : prev);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [showDemoResult, animationStep]);

  const handleDemoQuery = () => {
    setDemoQuery("Which customers closed deals but haven't paid?");
    setShowDemoResult(true);
    setAnimationStep(0);
  };

  const connectedSystems = Array.isArray(systemConnections) 
    ? systemConnections.filter((conn: any) => conn.isConnected) 
    : [];

  const systemStatus = [
    {
      name: "Salesforce CRM",
      type: "salesforce",
      connected: connectedSystems.some((conn: any) => conn.systemType === 'salesforce'),
      lastSync: "2 mins ago",
      records: "1,247 opportunities"
    },
    {
      name: "NetSuite ERP", 
      type: "netsuite",
      connected: connectedSystems.some((conn: any) => conn.systemType === 'netsuite'),
      lastSync: "5 mins ago",
      records: "3,456 transactions"
    },
    {
      name: "Custom APIs",
      type: "custom",
      connected: false,
      lastSync: "Not connected",
      records: "Ready to configure"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-orange-200">
            <Terminal className="text-orange-600" size={20} />
            <span className="font-mono text-sm font-bold text-orange-800">MOBIUS ONE v2.0</span>
            <Chip size="sm" color="success" variant="flat" className="font-mono">ONLINE</Chip>
          </div>
          
          <h1 className="text-6xl font-mono font-bold text-gray-900 mb-6 leading-tight">
            ONE AI INTERFACE<br />
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              FOR ALL YOUR BUSINESS SYSTEMS
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Ask questions across Salesforce, NetSuite, and more in natural language. 
            Get instant cross-system insights that would take hours to compile manually.
          </p>
          
          {/* Animated Data Flow Visualization */}
          <div className="mb-12 bg-white/40 backdrop-blur-sm rounded-2xl p-8 border border-orange-200">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-2">
                  <Database className="text-white" size={24} />
                </div>
                <span className="text-sm font-mono font-bold text-gray-700">SALESFORCE</span>
              </div>
              <ArrowRight className="text-orange-500 animate-pulse" size={24} />
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-2">
                  <Sparkles className="text-white" size={28} />
                </div>
                <span className="text-sm font-mono font-bold text-gray-700">AI TERMINAL</span>
              </div>
              <ArrowRight className="text-orange-500 animate-pulse" size={24} />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-2">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <span className="text-sm font-mono font-bold text-gray-700">NETSUITE</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <Button
              size="lg"
              color="primary"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-mono font-bold px-8 py-4 text-lg"
              endContent={<ArrowRight size={20} />}
              onClick={() => navigate('/login')}
              style={{ minHeight: '56px' }}
            >
              START QUERYING
            </Button>
            
            <Button
              size="lg"
              variant="bordered"
              className="border-2 border-gray-300 text-gray-700 font-mono font-bold px-8 py-4 text-lg hover:bg-gray-50"
              startContent={<Play size={20} />}
              onClick={handleDemoQuery}
              style={{ minHeight: '56px' }}
            >
              WATCH DEMO
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Demo Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-mono font-bold text-gray-900 mb-4">
              SEE IT IN ACTION
            </h2>
            <p className="text-xl text-gray-600">
              Watch how Mobius One connects data across systems to answer complex business questions
            </p>
          </div>

          <Card className="border border-gray-200 shadow-lg">
            <CardBody className="p-8">
              {/* Demo Query Input */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar 
                    size="sm" 
                    name="U" 
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-mono"
                  />
                  <span className="font-mono font-bold text-gray-700">YOU</span>
                </div>
                <Input
                  size="lg"
                  placeholder="Type your question here..."
                  value={demoQuery}
                  onChange={(e) => setDemoQuery(e.target.value)}
                  classNames={{
                    input: "font-mono",
                    inputWrapper: "bg-gray-50 border-2 border-gray-200 hover:border-orange-300 focus-within:border-orange-500"
                  }}
                  endContent={
                    <Button
                      isIconOnly
                      color="primary"
                      variant="flat"
                      size="sm"
                      onClick={handleDemoQuery}
                    >
                      <Search size={16} />
                    </Button>
                  }
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  <Chip 
                    size="sm" 
                    variant="flat" 
                    className="cursor-pointer hover:bg-orange-100 font-mono"
                    onClick={() => setDemoQuery("Which customers closed deals but haven't paid?")}
                  >
                    Which customers closed deals but haven't paid?
                  </Chip>
                  <Chip 
                    size="sm" 
                    variant="flat" 
                    className="cursor-pointer hover:bg-orange-100 font-mono"
                    onClick={() => setDemoQuery("Show me Q4 revenue trends")}
                  >
                    Show me Q4 revenue trends
                  </Chip>
                  <Chip 
                    size="sm" 
                    variant="flat" 
                    className="cursor-pointer hover:bg-orange-100 font-mono"
                    onClick={() => setDemoQuery("Top 5 opportunities at risk")}
                  >
                    Top 5 opportunities at risk
                  </Chip>
                </div>
              </div>

              {/* Animated Demo Result */}
              {showDemoResult && (
                <div className="space-y-4">
                  <Divider />
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    >
                      <Terminal size={16} />
                    </Avatar>
                    <span className="font-mono font-bold text-gray-700">MOBIUS ONE</span>
                    <Chip size="sm" color="success" variant="flat" className="font-mono">
                      95% CONFIDENCE
                    </Chip>
                  </div>

                  {animationStep >= 0 && (
                    <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-orange-500">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="text-green-500" size={16} />
                        <span className="font-mono text-sm font-bold text-gray-700">ANALYZING SALESFORCE + NETSUITE DATA</span>
                      </div>
                      {animationStep >= 1 && (
                        <div className="space-y-3">
                          <p className="text-gray-800 font-medium">
                            Found <strong>23 customers</strong> who closed deals in the last 30 days but have outstanding invoices:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono font-bold text-sm">ACME Corp</span>
                                <Chip size="sm" color="warning" variant="flat">$45K OVERDUE</Chip>
                              </div>
                              <p className="text-sm text-gray-600">Deal closed Dec 15, Payment due Dec 30</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono font-bold text-sm">TechFlow Inc</span>
                                <Chip size="sm" color="warning" variant="flat">$28K OVERDUE</Chip>
                              </div>
                              <p className="text-sm text-gray-600">Deal closed Dec 10, Payment due Dec 25</p>
                            </div>
                          </div>
                          {animationStep >= 2 && (
                            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="text-orange-600" size={16} />
                                <span className="font-mono font-bold text-sm text-orange-800">RECOMMENDED ACTIONS</span>
                              </div>
                              <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Send payment reminders to 23 customers ($847K total outstanding)</li>
                                <li>• Review credit terms for repeat late payers</li>
                                <li>• Consider payment plan options for largest overdue accounts</li>
                              </ul>
                            </div>
                          )}
                          {animationStep >= 3 && (
                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500 font-mono">
                              <span>Sources: Salesforce Opportunities, NetSuite AR Aging</span>
                              <span>Generated in 2.3s</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-center pt-4">
                    <Button
                      color="primary"
                      variant="flat"
                      className="font-mono font-bold"
                      endContent={<ArrowRight size={16} />}
                      onClick={() => navigate('/login')}
                    >
                      TRY IT NOW
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-mono font-bold text-gray-900 mb-4">
            SYSTEM STATUS
          </h2>
          <p className="text-xl text-gray-600">
            Real-time connection health and data freshness for all integrated systems
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {systemStatus.map((system) => (
            <Card 
              key={system.type}
              className={`border-2 transition-all duration-300 hover:shadow-lg ${
                system.connected 
                  ? 'border-green-200 bg-green-50/30' 
                  : 'border-gray-200 bg-gray-50/30'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      system.connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`} />
                    <h3 className="font-mono font-bold text-gray-900">{system.name}</h3>
                  </div>
                  <Chip 
                    size="sm" 
                    color={system.connected ? "success" : "default"}
                    variant="flat"
                    className="font-mono"
                  >
                    {system.connected ? "CONNECTED" : "OFFLINE"}
                  </Chip>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Clock size={14} />
                      <span>Last sync:</span>
                    </span>
                    <span className="font-mono font-medium">{system.lastSync}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Database size={14} />
                      <span>Data:</span>
                    </span>
                    <span className="font-mono font-medium">{system.records}</span>
                  </div>
                  {!system.connected && (
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="w-full font-mono font-bold"
                      endContent={<Settings size={14} />}
                      onClick={() => navigate('/settings')}
                    >
                      CONFIGURE
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-mono font-bold text-gray-900 mb-4">
              GETTING STARTED
            </h2>
            <p className="text-xl text-gray-600">
              Set up your AI Terminal in minutes with our step-by-step guide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step-by-step guide */}
            <Card className="border border-gray-200">
              <CardHeader>
                <h3 className="text-xl font-mono font-bold text-gray-900 flex items-center space-x-2">
                  <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                  <span>CONNECT YOUR FIRST SYSTEM</span>
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">SF</span>
                    </div>
                    <div>
                      <p className="font-mono font-bold text-sm">Salesforce CRM</p>
                      <p className="text-xs text-gray-600">Connect using OAuth or API key</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">NS</span>
                    </div>
                    <div>
                      <p className="font-mono font-bold text-sm">NetSuite ERP</p>
                      <p className="text-xs text-gray-600">Configure SuiteScript integration</p>
                    </div>
                  </div>
                </div>
                <Button
                  color="primary"
                  variant="flat"
                  className="w-full font-mono font-bold"
                  endContent={<ExternalLink size={16} />}
                  onClick={() => navigate('/settings')}
                >
                  OPEN SETTINGS
                </Button>
              </CardBody>
            </Card>

            {/* Sample queries */}
            <Card className="border border-gray-200">
              <CardHeader>
                <h3 className="text-xl font-mono font-bold text-gray-900 flex items-center space-x-2">
                  <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                  <span>TRY THESE SAMPLE QUERIES</span>
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  {[
                    "Show me this month's pipeline",
                    "Which deals are at risk of slipping?", 
                    "Compare Q4 revenue vs last year",
                    "List overdue invoices by customer",
                    "Top performing sales reps this quarter"
                  ].map((query, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors group"
                      onClick={() => {
                        setDemoQuery(query);
                        navigate('/query');
                      }}
                    >
                      <p className="font-mono text-sm text-gray-700 group-hover:text-orange-700">
                        "{query}"
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  color="primary"
                  variant="flat"
                  className="w-full font-mono font-bold"
                  endContent={<MessageSquare size={16} />}
                  onClick={() => navigate('/login')}
                >
                  START ASKING
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* Video walkthrough option */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
              <CardBody className="p-8">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <Play className="text-gray-600" size={24} />
                  <h3 className="text-xl font-mono font-bold text-gray-900">
                    PREFER A VIDEO WALKTHROUGH?
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Watch our 5-minute tutorial covering system setup, query techniques, and advanced features
                </p>
                <Button
                  size="lg"
                  variant="bordered"
                  className="border-2 border-gray-300 text-gray-700 font-mono font-bold"
                  startContent={<Play size={20} />}
                >
                  WATCH TUTORIAL
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-mono font-bold text-gray-900 mb-4">
            WHY CHOOSE MOBIUS ONE?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-mono font-bold text-gray-900">NATURAL LANGUAGE</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600">
                Ask questions in plain English. No complex queries or technical knowledge required.
              </p>
            </CardBody>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-mono font-bold text-gray-900">CROSS-SYSTEM INSIGHTS</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600">
                Connect data across Salesforce, NetSuite, and other business systems for comprehensive analysis.
              </p>
            </CardBody>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-mono font-bold text-gray-900">INSTANT RESULTS</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600">
                Get real-time answers with confidence scores and source attribution for every insight.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
          <CardBody className="p-12 text-center">
            <h2 className="text-4xl font-mono font-bold mb-4">
              READY TO TRANSFORM YOUR BUSINESS INTELLIGENCE?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of teams already using Mobius One to make data-driven decisions faster.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button
                size="lg"
                className="bg-white text-orange-600 font-mono font-bold px-8 py-4 text-lg hover:bg-gray-50"
                endContent={<ArrowRight size={20} />}
                onClick={() => navigate('/login')}
                style={{ minHeight: '56px' }}
              >
                START QUERYING NOW
              </Button>
              <Button
                size="lg"
                variant="bordered"
                className="border-2 border-white/30 text-white font-mono font-bold px-8 py-4 text-lg hover:bg-white/10"
                endContent={<Settings size={20} />}
                onClick={() => navigate('/login')}
                style={{ minHeight: '56px' }}
              >
                SIGN UP FREE
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}