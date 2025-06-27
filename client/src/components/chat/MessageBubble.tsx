import { Bot, User, TrendingUp, Database, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Message } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  userInitials?: string;
}

export default function MessageBubble({ message, userInitials = "U" }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Parse metadata if it exists
  let parsedMetadata = null;
  if (message.metadata) {
    try {
      parsedMetadata = JSON.parse(message.metadata);
    } catch (e) {
      console.error('Failed to parse message metadata:', e);
    }
  }

  const renderSalesforceData = (data: any[]) => (
    <Card className="mt-4 border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="text-sf-blue" size={16} />
            <span className="text-sm font-medium">Salesforce CRM Data</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {data.length} records
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {data.map((opp: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-sf-text">{opp.Name}</h4>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      opp.StageName?.includes('Closed') ? 'bg-green-100 text-green-800' :
                      opp.StageName?.includes('Negotiation') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {opp.StageName}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Expected Close: {new Date(opp.CloseDate).toLocaleDateString()}
                </p>
                {opp.AccountName && (
                  <p className="text-xs text-gray-500 mt-1">Account: {opp.AccountName}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-sf-text">
                  ${opp.Amount?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-500">{opp.Probability}% probability</p>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  <ExternalLink size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderNetSuiteData = (data: any[]) => (
    <Card className="mt-4 border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="text-blue-600" size={16} />
            <span className="text-sm font-medium">NetSuite ERP Data</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Financial Report
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item: any, index: number) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-sf-text mb-1">
                ${item.revenue?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600 mb-2">{item.period} Revenue</div>
              {item.growth && (
                <div className="flex items-center justify-center space-x-1">
                  <TrendingUp className="text-sf-success" size={16} />
                  <span className="text-sf-success font-medium text-sm">+{item.growth}%</span>
                </div>
              )}
              {item.previousPeriod && (
                <div className="text-xs text-gray-500 mt-2">
                  vs ${item.previousPeriod.toLocaleString()} previous period
                </div>
              )}
            </div>
          ))}
        </div>
        
        {data.length > 1 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="text-green-600" size={16} />
              <span className="text-sm font-medium text-green-900">Revenue Growth Analysis</span>
            </div>
            <div className="text-sm text-green-700">
              <p>Strong growth trajectory with consistent performance improvement</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSystemData = () => {
    if (!parsedMetadata || !Array.isArray(parsedMetadata)) return null;

    if (message.systemSource === 'salesforce') {
      return renderSalesforceData(parsedMetadata);
    }

    if (message.systemSource === 'netsuite') {
      return renderNetSuiteData(parsedMetadata);
    }

    return null;
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'justify-end message-user' : 'message-ai'}`}>
      {isUser && (
        <div className="flex-1 flex justify-end">
          <div className="bg-sf-blue rounded-lg p-4 max-w-2xl shadow-sm">
            <p className="text-white whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      )}

      {isAssistant && (
        <div className="w-8 h-8 bg-gradient-to-br from-sf-blue to-sf-light rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <Bot className="text-white" size={16} />
        </div>
      )}

      {isAssistant && (
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4 max-w-4xl shadow-sm">
            <div className="prose prose-sm max-w-none">
              <p className="text-sf-text whitespace-pre-wrap m-0">{message.content}</p>
            </div>
            
            {renderSystemData()}

            {/* AI Insights */}
            {parsedMetadata && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-sm font-medium text-blue-900">AI Insight</p>
                    <p className="text-sm text-blue-700">
                      This data has been analyzed and processed to provide you with actionable business insights.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs text-gray-400">AI Assistant</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {message.systemSource && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <Badge variant="outline" className="text-xs">
                  {message.systemSource === 'salesforce' ? 'Salesforce' : 'NetSuite'}
                </Badge>
              </>
            )}
          </div>
        </div>
      )}

      {isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gray-300 text-gray-600 text-sm font-medium">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
