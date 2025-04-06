import React from 'react';
import { MessageCircle, Bot } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onOptionSelect?: (option: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOptionSelect }) => {
  const isBot = message.role === 'bot';
  
  return (
    <div className={`flex items-start gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`p-2 rounded-full ${isBot ? 'bg-blue-100' : 'bg-gray-100'}`}>
        {isBot ? <Bot size={20} /> : <MessageCircle size={20} />}
      </div>
      <div className="max-w-[80%]">
        <div
          className={`p-4 rounded-2xl ${
            isBot ? 'bg-blue-50 text-blue-900' : 'bg-gray-50 text-gray-900'
          }`}
        >
          {message.content}
        </div>
        
        {message.options && message.options.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.options.map((option) => (
              <button
                key={option}
                onClick={() => onOptionSelect?.(option)}
                className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};