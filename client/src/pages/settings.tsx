import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  MessageSquare,
  CreditCard,
  ArrowRight
} from "lucide-react";

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });

  const { data: systemConnections = [] } = useQuery({
    queryKey: ['/api/systems'],
    enabled: true
  });

  const getSystemCapabilities = (systemType: string) => {
    const capabilities = {
      salesforce: {
        icon: <TrendingUp className="w-6 h-6" />,
        title: "Sales Intelligence",
        description: "Connected via Salesforce",
        capabilities: [
          "Revenue forecasting and pipeline health",
          "Customer relationship insights", 
          "Deal progression and win rates"
        ],
        recentInsight: "Q4 pipeline is 18% ahead of target"
      },
      netsuite: {
        icon: <DollarSign className="w-6 h-6" />,
        title: "Financial Intelligence",
        description: "Connected via NetSuite", 
        capabilities: [
          "Cash flow analysis and projections",
          "Invoice tracking and collections",
          "Revenue recognition and reporting"
        ],
        recentInsight: "3 accounts need attention this week"
      }
    };
    return capabilities[systemType as keyof typeof capabilities];
  };

  const availableIntegrations = [
    { name: "HubSpot", category: "Marketing", benefit: "Marketing campaign insights", icon: <BarChart3 className="w-5 h-5" /> },
    { name: "Zendesk", category: "Support", benefit: "Customer support intelligence", icon: <Users className="w-5 h-5" /> },
    { name: "Slack", category: "Communication", benefit: "Team communication patterns", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Stripe", category: "Payments", benefit: "Payment and subscription data", icon: <CreditCard className="w-5 h-5" /> }
  ];

  const connectedSystems = systemConnections.filter((conn: any) => conn.isActive);

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #FAFBFC 0%, rgba(193, 237, 204, 0.02) 100%)'}}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8" style={{color: '#048BA8'}} />
            <h1 className="text-3xl font-brand" style={{color: '#061A40', lineHeight: '1.4'}}>
              Expand Mobius Intelligence
            </h1>
          </div>
          
          <p className="text-lg font-body" style={{color: '#4A5568', lineHeight: '1.6'}}>
            The more systems I can access, the better insights I can provide for your business decisions.
          </p>
        </div>

        {/* Active Intelligence Sources */}
        {connectedSystems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-brand mb-6 flex items-center gap-2" style={{color: '#061A40'}}>
              <CheckCircle className="w-5 h-5" style={{color: '#048BA8'}} />
              Active Intelligence Sources
            </h2>
            
            <div className="space-y-4">
              {connectedSystems.map((system: any) => {
                const capabilities = getSystemCapabilities(system.systemType);
                if (!capabilities) return null;

                return (
                  <div
                    key={system.id}
                    className="p-6 rounded-xl border-2 transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #FAFBFC 0%, rgba(193, 237, 204, 0.1) 100%)',
                      border: '2px solid #C1EDCC'
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2 rounded-lg" style={{background: 'rgba(4, 139, 168, 0.1)', color: '#048BA8'}}>
                        {capabilities.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-brand mb-1" style={{color: '#061A40'}}>
                          {capabilities.title}
                        </h3>
                        <p className="text-sm font-body" style={{color: '#718096'}}>
                          {capabilities.description}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="font-body font-medium mb-2" style={{color: '#4A5568'}}>
                        I can help you with:
                      </p>
                      <ul className="space-y-1">
                        {capabilities.capabilities.map((capability, index) => (
                          <li key={index} className="flex items-start gap-2 font-body text-sm" style={{color: '#4A5568'}}>
                            <span style={{color: '#048BA8'}}>•</span>
                            {capability}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3" style={{borderTop: '1px solid rgba(4, 139, 168, 0.1)'}}>
                      <div className="inline-flex items-center px-3 py-1 rounded-md text-sm font-body font-medium" 
                           style={{background: 'rgba(4, 139, 168, 0.1)', color: '#048BA8'}}>
                        Recent insight: "{capabilities.recentInsight}"
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expand Knowledge Section */}
        <div className="mb-12">
          <div className="p-6 rounded-xl border-2 text-center transition-all duration-200"
               style={{
                 background: 'rgba(4, 139, 168, 0.05)',
                 border: '2px dashed #048BA8'
               }}>
            <Sparkles className="w-12 h-12 mx-auto mb-4" style={{color: '#048BA8'}} />
            <h2 className="text-xl font-brand mb-3" style={{color: '#061A40'}}>
              Expand My Knowledge
            </h2>
            <p className="font-body mb-6" style={{color: '#4A5568', lineHeight: '1.6'}}>
              What other business systems do you use? The more I know, the smarter I become.
            </p>

            {/* Search Integration */}
            <div className="relative max-w-md mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{color: '#718096'}} />
              <input
                type="text"
                placeholder="Search 170+ integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-body w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: 'white',
                  border: '2px solid #E2E8F0',
                  fontSize: '16px',
                  color: '#1a202c'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#048BA8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(4, 139, 168, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Popular Integrations */}
            <div className="text-left">
              <h3 className="font-brand font-medium mb-4" style={{color: '#048BA8'}}>
                Popular additions:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableIntegrations.map((integration, index) => (
                  <button
                    key={index}
                    className="group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left"
                    style={{
                      background: 'white',
                      border: '1px solid #E2E8F0'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#048BA8';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(4, 139, 168, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="p-1 rounded" style={{color: '#048BA8'}}>
                      {integration.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-body font-medium text-sm" style={{color: '#061A40'}}>
                        {integration.name}
                      </div>
                      <div className="font-body text-xs" style={{color: '#718096'}}>
                        {integration.benefit}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{color: '#048BA8'}} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Connected Systems Issue Alert (only show if there's a problem) */}
        {systemConnections.some((conn: any) => !conn.isActive) && (
          <div className="mb-8">
            <div className="flex items-start gap-4 p-4 rounded-xl" style={{background: 'rgba(245, 101, 101, 0.1)', border: '1px solid #F56565'}}>
              <AlertCircle className="w-5 h-5 mt-0.5" style={{color: '#F56565'}} />
              <div className="flex-1">
                <h3 className="font-brand font-medium mb-1" style={{color: '#C53030'}}>
                  Connection Issue
                </h3>
                <p className="font-body text-sm mb-3" style={{color: '#744210'}}>
                  I haven't been able to access your latest data from some systems.
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm font-body font-medium rounded-lg transition-colors"
                          style={{background: '#F56565', color: 'white'}}>
                    Fix Connection
                  </button>
                  <button className="px-4 py-2 text-sm font-body font-medium rounded-lg transition-colors"
                          style={{background: 'white', color: '#F56565', border: '1px solid #F56565'}}>
                    Get Help
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Encouraging Note */}
        <div className="mt-12 p-6 rounded-xl" style={{background: 'rgba(193, 237, 204, 0.1)', borderLeft: '4px solid #048BA8'}}>
          <p className="font-body" style={{color: '#061A40', lineHeight: '1.6', margin: 0}}>
            💡 Each new connection makes our conversations smarter and more valuable. 
            I learn your business patterns and can provide increasingly personalized insights.
          </p>
        </div>
      </div>
    </div>
  );
}