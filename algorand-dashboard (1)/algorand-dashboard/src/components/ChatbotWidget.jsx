import React, { useState, useRef, useEffect } from 'react';
import { useFinChain } from '../context/FinChainContext';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const { state } = useFinChain();
  const { isWalletConnected, dashboard, transactions } = state;
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am your FinChain AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchResponseFromBackend = async (userQuery) => {
    try {
      // STEP 4: Connect React frontend to the backend using fetch
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userQuery,
          contextData: { isWalletConnected, dashboard, transactions } 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error("Fetch error:", error);
      return "Something went wrong. Please check if your backend server is running.";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    
    setIsLoading(true);

    // Call the actual backend instead of the simulation
    const responseText = await fetchResponseFromBackend(userMsg);
    setMessages(prev => [...prev, { role: "assistant", content: responseText }]);
    
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="card chatbot-panel blue-theme-container">
      <div className="blue-theme-header">
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#FFFFFF', fontWeight: 'bold' }}>FinChain Bot</h3>
      </div>
      
      <div className="chat-body" style={{ flex: 1, backgroundColor: '#FFFFFF', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {messages.map((msg, index) => {
          const senderClass = msg.role === 'user' ? 'user' : 'bot';
          const alignment = msg.role === 'user' ? 'flex-end' : 'flex-start';
          return (
            <div key={index} style={{ display: 'flex', justifyContent: alignment }}>
              <div className={`finchain-chat-message ${senderClass}`} style={{ padding: '0.6rem 1rem', maxWidth: '85%', fontSize: '0.9rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
             <div className="finchain-chat-message bot" style={{ padding: '0.6rem 1rem', maxWidth: '85%', fontSize: '0.9rem', fontStyle: 'italic' }}>
               Typing...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer" style={{ padding: '0.8rem 1rem', borderTop: '1px solid #EFF6FF', backgroundColor: '#FFFFFF', display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          className="finchain-chat-input"
          placeholder="Ask about finances..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{ flex: 1, padding: '0.5rem 0.8rem', outline: 'none' }}
        />
        <button 
          className="finchain-chat-send"
          onClick={handleSend}
          disabled={isLoading}
          style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotWidget;
