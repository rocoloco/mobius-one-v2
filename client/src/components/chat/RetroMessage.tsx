import { 
  Card, 
  CardBody, 
  CardHeader,
  Chip,
  Avatar,
  Button,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/react";
import { 
  Bot, 
  User, 
  TrendingUp, 
  Database, 
  ExternalLink,
  Activity,
  DollarSign,
  Calendar,
  Target,
  BarChart3
} from "lucide-react";
import type { Message } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RetroMessageProps {
  message: Message;
}

export default function RetroMessage({ message }: RetroMessageProps) {
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
    <Card className="mt-4 retro-card border-primary-400">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Database className="text-white" size={16} />
            </div>
            <div>
              <h4 className="font-mono font-bold text-sm uppercase tracking-wider">
                SALESFORCE_CRM_DATA
              </h4>
              <p className="text-xs text-foreground-500 font-mono">
                OPPORTUNITIES_PIPELINE_REPORT
              </p>
            </div>
          </div>
          <Chip 
            size="sm" 
            color="primary" 
            variant="flat"
            className="font-mono text-xs"
          >
            {data.length} RECORDS
          </Chip>
        </div>
      </CardHeader>
      <CardBody>
        <Table 
          aria-label="Salesforce opportunities"
          className="data-table"
          removeWrapper
        >
          <TableHeader>
            <TableColumn>OPPORTUNITY</TableColumn>
            <TableColumn>STAGE</TableColumn>
            <TableColumn>AMOUNT</TableColumn>
            <TableColumn>PROBABILITY</TableColumn>
            <TableColumn>CLOSE_DATE</TableColumn>
            <TableColumn>ACTION</TableColumn>
          </TableHeader>
          <TableBody>
            {data.map((opp: any, index: number) => (
              <TableRow key={index} className="hover:bg-content2 transition-colors">
                <TableCell>
                  <div>
                    <div className="font-mono font-bold text-sm">{opp.Name}</div>
                    {opp.AccountName && (
                      <div className="text-xs text-foreground-500 font-mono">
                        {opp.AccountName}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip 
                    size="sm"
                    color={
                      opp.StageName?.includes('Closed') ? "success" :
                      opp.StageName?.includes('Negotiation') ? "warning" :
                      "primary"
                    }
                    variant="flat"
                    className="font-mono text-xs"
                  >
                    {opp.StageName}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3 text-success-500" />
                    <span className="font-mono font-bold">
                      {opp.Amount?.toLocaleString() || 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Target className="w-3 h-3 text-warning-500" />
                    <span className="font-mono">{opp.Probability}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-primary" />
                    <span className="font-mono text-xs">
                      {new Date(opp.CloseDate).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    isIconOnly
                    className="retro-button"
                  >
                    <ExternalLink size={12} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );

  const renderNetSuiteData = (data: any[]) => (
    <Card className="mt-4 retro-card border-secondary-400">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <div className="bg-secondary-500 p-2 rounded-lg">
              <BarChart3 className="text-white" size={16} />
            </div>
            <div>
              <h4 className="font-mono font-bold text-sm uppercase tracking-wider">
                NETSUITE_ERP_DATA
              </h4>
              <p className="text-xs text-foreground-500 font-mono">
                FINANCIAL_PERFORMANCE_REPORT
              </p>
            </div>
          </div>
          <Chip 
            size="sm" 
            color="secondary" 
            variant="flat"
            className="font-mono text-xs"
          >
            FINANCIAL_METRICS
          </Chip>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item: any, index: number) => (
            <Card key={index} className="bg-content2 border border-default-300">
              <CardBody className="text-center p-4">
                <div className="text-3xl font-mono font-bold text-foreground mb-2">
                  ${item.revenue?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-foreground-600 mb-3 font-mono uppercase tracking-wide">
                  {item.period} REVENUE
                </div>
                {item.growth && (
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="text-success-500" size={16} />
                    <Chip 
                      size="sm" 
                      color="success" 
                      variant="flat"
                      className="font-mono text-xs"
                    >
                      +{item.growth}% GROWTH
                    </Chip>
                  </div>
                )}
                {item.previousPeriod && (
                  <div className="mt-2">
                    <Divider className="my-2" />
                    <div className="text-xs text-foreground-500 font-mono">
                      PREV: ${item.previousPeriod.toLocaleString()}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
        
        {data.length > 1 && (
          <Card className="mt-4 bg-success-100 border border-success-300">
            <CardBody className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="text-success-600" size={16} />
                <span className="text-sm font-mono font-bold uppercase text-success-800">
                  PERFORMANCE_ANALYSIS
                </span>
              </div>
              <div className="text-sm text-success-700 font-mono">
                &gt; STRONG_GROWTH_TRAJECTORY_DETECTED
              </div>
              <div className="text-sm text-success-700 font-mono">
                &gt; CONSISTENT_PERFORMANCE_IMPROVEMENT
              </div>
            </CardBody>
          </Card>
        )}
      </CardBody>
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {isUser ? (
        /* iOS-style user message bubble with retro styling */
        <div className="flex items-end space-x-2 max-w-[70%]">
          <div 
            className="message-bubble user px-4 py-3 rounded-2xl font-mono text-sm"
            style={{
              background: 'linear-gradient(135deg, #ff9800 0%, #ff6f00 100%)',
              color: 'white',
              borderRadius: '18px 18px 4px 18px',
              boxShadow: '0 1px 3px rgba(255, 152, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              marginLeft: 'auto'
            }}
          >
            {message.content}
          </div>
          <Avatar
            size="sm"
            name="JD"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-mono font-bold text-xs"
          />
        </div>
      ) : (
        /* iOS-style assistant message with retro styling */
        <div className="flex items-start space-x-3 max-w-[85%]">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="text-white" size={14} />
          </div>
          
          <div className="flex-1">
            <div 
              className="message-bubble assistant px-4 py-3 rounded-2xl font-mono text-sm"
              style={{
                background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
                color: '#2d2d2d',
                borderRadius: '18px 18px 18px 4px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              
              {renderSystemData()}

              {/* iOS-style processing indicator */}
              {parsedMetadata && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <Activity className="text-blue-600 flex-shrink-0 mt-0.5" size={14} />
                    <div>
                      <p className="text-xs font-mono font-bold text-blue-800 mb-1">
                        PROCESSING COMPLETE
                      </p>
                      <p className="text-xs text-blue-700 font-mono">
                        Data analyzed and insights generated
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* iOS-style message metadata */}
            <div className="flex items-center space-x-2 mt-1 ml-1">
              <span className="text-xs text-gray-500 font-mono">
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
              {message.systemSource && (
                <>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-500 font-mono uppercase">
                    {message.systemSource}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}