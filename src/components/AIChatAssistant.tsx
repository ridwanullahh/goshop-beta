
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCommerce } from '@/context/CommerceContext';
import { MessageCircle, Send, Bot, User, Minimize2, Maximize2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  mode: 'buyer' | 'seller';
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

export function AIChatAssistant({ 
  mode, 
  isMinimized = false, 
  onToggleMinimize, 
  onClose 
}: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sdk, currentUser } = useCommerce();
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: mode === 'buyer' 
        ? "Hi! I'm your AI shopping assistant. I can help you find products, compare options, answer questions, and guide you through your shopping journey. What can I help you with today?"
        : "Hello! I'm your AI business consultant. I can help optimize your pricing, analyze your sales performance, suggest marketing strategies, and grow your business. How can I assist you?",
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, [mode]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response = '';
      
      if (sdk?.aiHelper) {
        if (mode === 'buyer') {
          const context = {
            userId: currentUser?.id,
            recentActivity: messages.slice(-5),
            currentPage: window.location.pathname
          };
          response = await sdk.aiHelper.buyerAssistant(input, context);
        } else {
          // For seller mode, gather seller-specific data
          const sellerData = {
            userId: currentUser?.id,
            // Add seller-specific context here
            recentOrders: [],
            inventory: [],
            analytics: {}
          };
          response = await sdk.aiHelper.sellerAssistant(input, sellerData);
        }
      } else {
        // Fallback responses
        response = mode === 'buyer'
          ? "I'm here to help with your shopping needs! While I'm currently in basic mode, I can still assist with general product information and shopping guidance."
          : "I'm ready to help grow your business! While I'm in basic mode, I can provide general business advice and best practices.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Assistant Error",
        description: "Sorry, I encountered an error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = mode === 'buyer' 
    ? [
        "Find eco-friendly products under $50",
        "Compare wireless headphones",
        "Show me trending electronics",
        "Help me find a gift for someone"
      ]
    : [
        "Analyze my sales performance",
        "Suggest optimal pricing for my products",
        "Help me write product descriptions",
        "Recommend marketing strategies"
      ];

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-16 h-16 cursor-pointer hover:shadow-lg transition-shadow z-50">
        <CardContent 
          className="p-0 h-full flex items-center justify-center"
          onClick={onToggleMinimize}
        >
          <MessageCircle className="w-6 h-6 text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col shadow-xl z-50">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            {mode === 'buyer' ? 'Shopping Assistant' : 'Business Consultant'}
          </CardTitle>
          <div className="flex gap-1">
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMinimize}
                className="h-8 w-8"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="w-fit">
          AI-Powered • Real-time
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-2">
        {/* Messages */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
            <div className="grid grid-cols-1 gap-1">
              {quickActions.slice(0, 2).map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput(action)}
                  className="text-xs h-auto p-2 justify-start"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={mode === 'buyer' ? "Ask about products..." : "Ask about your business..."}
            className="text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
