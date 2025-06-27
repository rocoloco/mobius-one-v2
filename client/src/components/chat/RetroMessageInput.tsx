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
        {/* iOS-style Quick Command Suggestions */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Command className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono font-bold text-foreground-700 uppercase tracking-wide">
              QUICK_COMMANDS:
            </span>
          </div>
          <div className="ios-segmented-control mb-2">
            {suggestedCommands.slice(0, 2).map((cmd, index) => (
              <div
                key={index}
                className={`ios-segment ${message === cmd ? 'active' : ''}`}
                onClick={() => setMessage(cmd)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setMessage(cmd);
                  }
                }}
              >
                {cmd}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedCommands.slice(2).map((cmd, index) => (
              <Chip
                key={index + 2}
                size="sm"
                variant="flat"
                className="font-mono text-xs cursor-pointer hover:bg-primary-100 transition-all duration-150"
                onClick={() => setMessage(cmd)}
              >
                {cmd}
              </Chip>
            ))}
          </div>
        </div>
        
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <div className="ios-input-container">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder=" "
                  className="ios-input resize-none min-h-[60px] max-h-[120px] w-full font-mono text-sm"
                  disabled={disabled}
                  rows={2}
                  style={{
                    paddingRight: '120px' // Space for action buttons
                  }}
                />
                <label className="ios-floating-label font-mono text-sm">
                  {placeholder}
                </label>
                
                {/* iOS-style action buttons */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-1">
                  <Tooltip content="Attach File">
                    <button
                      type="button"
                      onClick={handleAttachFile}
                      className="p-2 rounded-full hover:bg-gray-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ minWidth: '32px', minHeight: '32px' }}
                    >
                      <Paperclip size={14} className="text-gray-600" />
                    </button>
                  </Tooltip>
                  
                  <Tooltip content="Add Emoji">
                    <button
                      type="button"
                      onClick={handleAddEmoji}
                      className="p-2 rounded-full hover:bg-gray-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ minWidth: '32px', minHeight: '32px' }}
                    >
                      <Smile size={14} className="text-gray-600" />
                    </button>
                  </Tooltip>
                  
                  <Tooltip content={isListening ? "Stop Recording" : "Voice Input"}>
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`p-2 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        isListening 
                          ? 'text-red-500 bg-red-50 animate-pulse' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      style={{ minWidth: '32px', minHeight: '32px' }}
                    >
                      {isListening ? <Square size={14} /> : <Mic size={14} />}
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
            
            {/* iOS-style Input Status Bar */}
            <div className="flex items-center justify-between mt-3 px-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-xs font-mono text-foreground-500">
                  <Terminal className="w-3 h-3" />
                  <span>⏎ SEND • ⇧⏎ NEW LINE</span>
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
                {/* iOS-style Character Counter */}
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        progressValue > 90 ? 'bg-red-500' : 
                        progressValue > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(progressValue, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono ${
                    charCount > maxChars * 0.9 ? 'text-red-500' : 'text-foreground-500'
                  }`}>
                    {charCount}/{maxChars}
                  </span>
                </div>
                
                {/* System Status */}
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3 text-green-500 animate-pulse" />
                  <span className="text-xs text-foreground-500 font-mono">
                    AI_READY
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* iOS-style Send Button with retro styling */}
          <Tooltip content="Execute Command">
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`retro-button font-mono font-bold uppercase tracking-wider transition-all duration-150 ${
                canSend 
                  ? 'opacity-100 cursor-pointer transform-gpu active:scale-95' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{
                minHeight: '44px',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Send size={16} />
              EXECUTE
            </button>
          </Tooltip>
        </div>
      </CardBody>
    </Card>
  );
}