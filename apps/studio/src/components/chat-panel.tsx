"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Search } from "lucide-react";
// Removed direct RAG import - now using API proxy

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Olá! Sou o Vina.dev AI. Como posso ajudar você a criar sua aplicação hoje?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [ragQuery, setRagQuery] = useState("");
  const [ragResponses, setRagResponses] = useState<string[]>([]);
  const [ragStatus, setRagStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Entendi! Vou ajudar você com isso. Por favor, aguarde enquanto processo sua solicitação...",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleRagQuery = async () => {
    if (!ragQuery.trim()) return;

    setRagStatus('loading');
    setRagResponses([]);

    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: ragQuery }),
      });

      const data = await response.json();
      
      if (data.ok && data.answers) {
        setRagResponses(data.answers.slice(0, 3)); // Top 3 responses
        setRagStatus('success');
      } else {
        setRagResponses([data.error || 'Erro desconhecido ao consultar RAG']);
        setRagStatus('error');
      }
    } catch (error) {
      setRagResponses(['Erro ao consultar RAG. Verifique a conexão.']);
      setRagStatus('error');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">AI Assistant</h2>
          </div>
          {/* RAG Status Badge */}
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                ragStatus === 'success'
                  ? 'bg-green-500'
                  : ragStatus === 'error'
                  ? 'bg-red-500'
                  : ragStatus === 'loading'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-gray-300'
              }`}
            />
            <span className="text-xs text-gray-500">RAG</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* RAG Section */}
      <div className="border-t bg-gray-50 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Perguntar ao RAG</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRagQuery()}
              placeholder="Ex: como trocar cor com Tailwind"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={ragStatus === 'loading'}
            />
            <Button 
              onClick={handleRagQuery} 
              size="sm" 
              disabled={ragStatus === 'loading' || !ragQuery.trim()}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* RAG Responses */}
        {ragResponses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-600">Respostas do RAG:</h4>
            <div className="space-y-1">
              {ragResponses.map((response, index) => (
                <div
                  key={index}
                  className="text-xs bg-white p-2 rounded border text-gray-700"
                >
                  {response}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button onClick={handleSend} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}