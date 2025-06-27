import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, Smile, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ 
  onSendMessage, 
  disabled,
  placeholder = "Ask me anything about your Salesforce CRM or NetSuite ERP data..."
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    
    onSendMessage(message);
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleVoiceInput = () => {
    // Toggle voice input - this would integrate with speech recognition API
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

  const canSend = message.trim() && !disabled;

  return (
    <div className="p-6 border-t border-gray-200 bg-white">
      <div className="flex items-end space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[48px] max-h-[120px] resize-none pr-24 border-gray-300 focus:ring-2 focus:ring-sf-blue focus:border-transparent transition-all"
              disabled={disabled}
            />
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={handleAttachFile}
                  >
                    <Paperclip size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach file</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={handleAddEmoji}
                  >
                    <Smile size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add emoji</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 h-auto transition-colors ${
                      isListening 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                    onClick={handleVoiceInput}
                  >
                    {isListening ? <Square size={16} /> : <Mic size={16} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isListening ? 'Stop recording' : 'Voice input'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {isListening && (
                <Badge variant="destructive" className="animate-pulse">
                  Recording...
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Powered by LiteLLM</span>
              <div className="w-2 h-2 bg-sf-success rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleSend}
              disabled={!canSend}
              className={`p-4 rounded-lg shadow-sm transition-all ${
                canSend 
                  ? 'bg-sf-blue hover:bg-sf-dark text-white hover:shadow-md' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Send message</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
