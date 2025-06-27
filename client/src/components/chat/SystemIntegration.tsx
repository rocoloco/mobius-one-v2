import { Database, CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SystemConnection } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface SystemIntegrationProps {
  systemConnections: SystemConnection[];
}

export default function SystemIntegration({ systemConnections }: SystemIntegrationProps) {
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set());

  const getSalesforceConnection = () => 
    systemConnections.find(conn => conn.systemType === 'salesforce');
  
  const getNetSuiteConnection = () => 
    systemConnections.find(conn => conn.systemType === 'netsuite');

  const testConnection = async (systemType: string) => {
    setTestingConnections(prev => new Set(prev).add(systemType));
    
    try {
      const endpoint = systemType === 'salesforce' ? '/api/salesforce/test' : '/api/netsuite/test';
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      const result = await response.json();
      console.log(`${systemType} test result:`, result);
      
      // TODO: Show success/error toast
    } catch (error) {
      console.error(`Error testing ${systemType} connection:`, error);
    } finally {
      setTestingConnections(prev => {
        const newSet = new Set(prev);
        newSet.delete(systemType);
        return newSet;
      });
    }
  };

  const renderSystemCard = (
    connection: SystemConnection | undefined,
    systemType: 'salesforce' | 'netsuite',
    icon: React.ReactNode,
    displayName: string,
    description: string
  ) => {
    const isConnected = connection?.isConnected ?? false;
    const isTesting = testingConnections.has(systemType);
    const lastSync = connection?.lastSync;

    return (
      <Card className="border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {icon}
              <span className="text-sm font-medium">{displayName}</span>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <CheckCircle className="w-4 h-4 text-sf-success" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => testConnection(systemType)}
                    disabled={isTesting}
                    className="p-1 h-auto"
                  >
                    <RefreshCw 
                      className={`w-3 h-3 text-gray-500 ${isTesting ? 'animate-spin' : ''}`} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Test connection</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isConnected ? "default" : "destructive"} 
                className="text-xs"
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {isTesting && (
                <Badge variant="outline" className="text-xs">
                  Testing...
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-gray-600">
              {description}
            </p>
            
            <p className="text-xs text-gray-500">
              Last sync: {lastSync ? 
                formatDistanceToNow(new Date(lastSync), { addSuffix: true }) : 
                'Never'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-2">
      {renderSystemCard(
        getSalesforceConnection(),
        'salesforce',
        <Database className="text-sf-blue" size={16} />,
        'Salesforce CRM',
        'Customer relationship management'
      )}
      
      {renderSystemCard(
        getNetSuiteConnection(),
        'netsuite',
        <Database className="text-blue-600" size={16} />,
        'NetSuite ERP',
        'Enterprise resource planning'
      )}
      
      {/* System Status Summary */}
      <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="text-blue-600" size={14} />
          <span className="text-xs font-medium text-blue-900">System Status</span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          {systemConnections.filter(conn => conn.isConnected).length} of {systemConnections.length} systems connected
        </p>
      </div>
    </div>
  );
}
