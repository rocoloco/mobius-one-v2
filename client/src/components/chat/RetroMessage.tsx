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
    <div className={`flex items-start space-x-4 ${isUser ? 'justify-end message-user' : 'message-ai'}`}>
      {isUser && (
        <div className="flex-1 flex justify-end">
          <Card className="message-bubble user retro-card bg-primary text-primary-foreground max-w-md">
            <CardBody className="p-4">
              <p className="font-mono whitespace-pre-wrap">{message.content}</p>
            </CardBody>
          </Card>
        </div>
      )}

      {isAssistant && (
        <div className="retro-gradient p-2 rounded-lg flex-shrink-0">
          <Bot className="text-white" size={16} />
        </div>
      )}

      {isAssistant && (
        <div className="flex-1">
          <Card className="message-bubble assistant retro-card max-w-4xl">
            <CardBody className="p-4">
              <div className="prose prose-sm max-w-none">
                <p className="font-mono text-sm whitespace-pre-wrap m-0 leading-relaxed">
                  {message.content}
                </p>
              </div>
              
              {renderSystemData()}

              {/* AI Processing Insights */}
              {parsedMetadata && (
                <Card className="mt-4 bg-primary-50 border border-primary-300">
                  <CardBody className="p-3">
                    <div className="flex items-start space-x-2">
                      <Activity className="text-primary flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-mono font-bold text-primary-800 uppercase tracking-wide">
                          AI_PROCESSING_COMPLETE
                        </p>
                        <p className="text-sm text-primary-700 font-mono">
                          &gt; DATA_ANALYZED_AND_PROCESSED
                        </p>
                        <p className="text-sm text-primary-700 font-mono">
                          &gt; INSIGHTS_GENERATED_FOR_BUSINESS_DECISION_MAKING
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </CardBody>
          </Card>
          
          <div className="flex items-center space-x-3 mt-2 ml-2">
            <Chip 
              size="sm" 
              variant="flat" 
              className="font-mono text-xs"
              startContent={<Bot className="w-3 h-3" />}
            >
              AI_ASSISTANT
            </Chip>
            <span className="text-xs text-foreground-500 font-mono">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }).toUpperCase()}
            </span>
            {message.systemSource && (
              <>
                <Divider orientation="vertical" className="h-3" />
                <Chip 
                  size="sm" 
                  color={message.systemSource === 'salesforce' ? 'primary' : 'secondary'}
                  variant="flat"
                  className="font-mono text-xs"
                  startContent={<Database className="w-3 h-3" />}
                >
                  {message.systemSource === 'salesforce' ? 'SALESFORCE' : 'NETSUITE'}
                </Chip>
              </>
            )}
          </div>
        </div>
      )}

      {isUser && (
        <Avatar
          size="sm"
          name="JD"
          className="bg-primary-600 text-white font-mono font-bold"
        />
      )}
    </div>
  );
}