import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled, 
  placeholder = "Type your message...",
  maxLength = 500
}) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateInput = (text: string): boolean => {
    // Check if input is empty or only whitespace
    if (!text.trim()) {
      setError('Please enter a message');
      return false;
    }

    // Check if input exceeds maximum length
    if (text.length > maxLength) {
      setError(`Message cannot exceed ${maxLength} characters`);
      return false;
    }

    // Clear any previous errors
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInput(input)) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (validateInput(input)) {
        onSend(input.trim());
        setInput('');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
    
    // Validate as user types
    if (newValue.length > maxLength) {
      setError(`Message cannot exceed ${maxLength} characters`);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`w-full p-3 rounded-lg border ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            autoComplete="off"
          />
          {error && (
            <div className="absolute -top-6 left-0 text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};