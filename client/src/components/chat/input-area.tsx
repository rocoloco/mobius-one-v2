import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface InputAreaProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function InputArea({ onSendMessage, disabled }: InputAreaProps) {
  const [message, setMessage] = useState("");
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
              placeholder="Ask me anything about your Salesforce CRM or NetSuite ERP data..."
              className="min-h-[48px] max-h-[120px] resize-none pr-20 border-gray-300 focus:ring-2 focus:ring-sf-blue focus:border-transparent"
              disabled={disabled}
            />
            <div className="absolute bottom-2 right-2 flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <Paperclip size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <Smile size={16} />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Powered by LiteLLM</span>
              <div className="w-2 h-2 bg-sf-success rounded-full" />
            </div>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-sf-blue hover:bg-sf-dark text-white p-4 rounded-lg shadow-sm hover:shadow-md"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
