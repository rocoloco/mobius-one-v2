import { useState, useRef, KeyboardEvent } from "react";
import { 
  Button, 
  Textarea, 
  Card,
  CardBody,
  Chip,
  Tooltip,
  Progress
} from "@heroui/react";
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Square,
  Terminal,
  Command,
  Zap
} from "lucide-react";

interface RetroMessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function RetroMessageInput({ 
  onSendMessage, 
  disabled,
  placeholder = "ENTER_COMMAND_OR_QUERY_FOR_BUSINESS_SYSTEMS..."
}: RetroMessageInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxChars = 2000;
  const progressValue = (charCount / maxChars) * 100;

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    
    onSendMessage(message);
    setMessage("");
    setCharCount(0);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (value: string) => {
    if (value.length <= maxChars) {
      setMessage(value);
      setCharCount(value.length);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // TODO: Implement speech-to-text functionality
  };

  const handleAttachFile = () => {
    // TODO: Implement file attachment functionality
    console.log("Attach file");
  };

  const handleAddEmoji = () => {
    // TODO: Implement emoji picker
    console.log("Add emoji");
  };

  const canSend = message.trim() && !disabled && charCount <= maxChars;

  const suggestedCommands = [
    "Show top opportunities this quarter",
    "Revenue analysis for last 6 months", 
    "Create new customer record",
    "Export financial data"
  ];

  return (
    <Card className="terminal-window rounded-none border-t-2 border-primary-300">
      <div className="terminal-header">
        <div className="terminal-dot red"></div>
        <div className="terminal-dot yellow"></div>
        <div className="terminal-dot green"></div>
        <span className="font-mono text-xs text-foreground-600 ml-2">
          INPUT_TERMINAL_v1.2
        </span>
      </div>
      
      <CardBody className="p-6">
        {/* Quick Command Suggestions */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Command className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono font-bold text-foreground-700 uppercase tracking-wide">
              QUICK_COMMANDS:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedCommands.map((cmd, index) => (
              <Chip
                key={index}
                size="sm"
                variant="flat"
                className="font-mono text-xs cursor-pointer hover:bg-primary-100 transition-colors"
                onClick={() => setMessage(cmd)}
              >
                {cmd}
              </Chip>
            ))}
          </div>
        </div>
        
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="relative">
                <Textarea
                  value={message}
                  onValueChange={handleTextareaChange}
                  placeholder={placeholder}
                  className="retro-input font-mono text-sm"
                  classNames={{
                    input: "font-mono placeholder:text-foreground-400 placeholder:uppercase placeholder:tracking-wide",
                    inputWrapper: "border-2 border-default-400 hover:border-primary-500 focus-within:border-primary-500",
                  }}
                  minRows={2}
                  maxRows={6}
                  disabled={disabled}
                />
                <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                  <Tooltip content="Attach File">
                    <Button
                      variant="light"
                      size="sm"
                      isIconOnly
                      onPress={handleAttachFile}
                      className="retro-button text-xs"
                    >
                      <Paperclip size={14} />
                    </Button>
                  </Tooltip>
                  
                  <Tooltip content="Add Emoji">
                    <Button
                      variant="light"
                      size="sm"
                      isIconOnly
                      onPress={handleAddEmoji}
                      className="retro-button text-xs"
                    >
                      <Smile size={14} />
                    </Button>
                  </Tooltip>
                  
                  <Tooltip content={isListening ? "Stop Recording" : "Voice Input"}>
                    <Button
                      variant="light"
                      size="sm"
                      isIconOnly
                      onPress={handleVoiceInput}
                      className={`retro-button text-xs ${
                        isListening 
                          ? 'text-danger-500 animate-pulse' 
                          : ''
                      }`}
                    >
                      {isListening ? <Square size={14} /> : <Mic size={14} />}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
            
            {/* Input Status Bar */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-xs font-mono text-foreground-500">
                  <Terminal className="w-3 h-3" />
                  <span>ENTER_TO_SEND • SHIFT+ENTER_FOR_NEW_LINE</span>
                </div>
                {isListening && (
                  <Chip 
                    size="sm" 
                    color="danger" 
                    variant="flat"
                    className="animate-pulse font-mono text-xs"
                    startContent={<Mic className="w-3 h-3" />}
                  >
                    RECORDING...
                  </Chip>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Character Counter */}
                <div className="flex items-center space-x-2">
                  <Progress 
                    size="sm" 
                    value={progressValue}
                    color={progressValue > 90 ? "danger" : progressValue > 70 ? "warning" : "success"}
                    className="w-16"
                  />
                  <span className={`text-xs font-mono ${
                    charCount > maxChars * 0.9 ? 'text-danger-500' : 'text-foreground-500'
                  }`}>
                    {charCount}/{maxChars}
                  </span>
                </div>
                
                {/* System Status */}
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3 text-success-500 animate-pulse" />
                  <span className="text-xs text-foreground-500 font-mono">
                    LITELLM_AI_READY
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Send Button */}
          <Tooltip content="Execute Command">
            <Button
              onPress={handleSend}
              disabled={!canSend}
              className={`retro-button px-6 py-4 font-mono font-bold uppercase tracking-wider ${
                canSend 
                  ? 'bg-primary text-primary-foreground hover:bg-primary-600' 
                  : 'bg-default-200 text-default-500 cursor-not-allowed'
              }`}
              startContent={<Send size={16} />}
            >
              EXECUTE
            </Button>
          </Tooltip>
        </div>
      </CardBody>
    </Card>
  );
}