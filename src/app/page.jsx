"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  MessageSquare,
  MoreHorizontal,
  Send,
  User,
  Bot,
  X,
  Menu,
  Settings,
  HelpCircle,
  Activity,
  Mic,
} from "lucide-react";

// Main App Component
const App = () => {
  // State for managing sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for chat messages
  const [messages, setMessages] = useState([]); // Start with no messages

  // State for the current input value
  const [inputValue, setInputValue] = useState("");

  // State to indicate if the bot is "thinking"
  const [isTyping, setIsTyping] = useState(false);

  // Ref for the end of the messages list to enable auto-scrolling
  const messagesEndRef = useRef(null);

  // Effect to scroll to the latest message whenever the messages array updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Function to handle sending a message
  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    // Add user's message to the state
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate a bot response after a short delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: `This is a simulated response to: "${userMessage.text}". This UI is for demonstration purposes and is not connected to a live AI model.`,
        sender: "bot",
      };
      setIsTyping(false);
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 2000);
  };

  // Handle key press for sending message with Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (promptText) => {
    setInputValue(promptText);
  };

  // Sidebar Component
  const Sidebar = () => (
    <aside
      className={`bg-gray-900 text-white absolute md:relative w-64 h-full flex flex-col p-2 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out z-20`}
    >
      <div className="flex-1">
        <button className="w-full flex items-center gap-2 p-2 rounded-md text-sm hover:bg-white/10 transition-colors mb-4">
          <Plus size={18} /> New chat
        </button>
        <div className="flex flex-col gap-2">
          {/* Placeholder for conversation history */}
          <div className="flex items-center justify-between p-2 rounded-md bg-white/5 cursor-pointer">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span className="text-sm truncate">Example Conversation</span>
            </div>
            <MoreHorizontal size={16} />
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 pt-2">
        <nav className="flex flex-col gap-1">
          <a
            href="#"
            className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-white/10 transition-colors"
          >
            <User size={16} /> My Account
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-white/10 transition-colors"
          >
            <Settings size={16} /> Settings
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-white/10 transition-colors"
          >
            <HelpCircle size={16} /> Help & FAQ
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-white/10 transition-colors"
          >
            <Activity size={16} /> Activity
          </a>
        </nav>
      </div>
    </aside>
  );

  // Chat Message Component
  const ChatMessage = ({ message }) => {
    const isBot = message.sender === "bot";
    return (
      <div
        className={`flex items-start gap-4 p-4 md:p-6 ${
          isBot ? "bg-gray-700/30" : ""
        }`}
      >
        <div
          className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
            isBot ? "bg-indigo-500" : "bg-blue-500"
          }`}
        >
          {isBot ? (
            <Bot size={20} className="text-white" />
          ) : (
            <User size={20} className="text-white" />
          )}
        </div>
        <div className="flex-1 pt-1">
          <p className="text-white whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    );
  };

  // Initial screen with prompt suggestions
  const InitialScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <div className="text-center mb-12">
        <div className="inline-block p-3 bg-white/10 rounded-full">
          <Bot size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mt-4">
          How can I help you today?
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        <button
          onClick={() => handlePromptClick("Tell me about your experience")}
          className="bg-white/5 p-4 rounded-lg text-left hover:bg-white/10 transition-colors"
        >
          <p className="font-semibold text-white">Experience</p>
          <p className="text-sm text-gray-400">
            Show me your professional background
          </p>
        </button>
        <button
          onClick={() =>
            handlePromptClick("What is your educational background?")
          }
          className="bg-white/5 p-4 rounded-lg text-left hover:bg-white/10 transition-colors"
        >
          <p className="font-semibold text-white">Education</p>
          <p className="text-sm text-gray-400">Tell me where you've studied</p>
        </button>
        <button
          onClick={() => handlePromptClick("Tell me about yourself")}
          className="bg-white/5 p-4 rounded-lg text-left hover:bg-white/10 transition-colors"
        >
          <p className="font-semibold text-white">About Me</p>
          <p className="text-sm text-gray-400">Give me a brief introduction</p>
        </button>
        <button
          onClick={() => handlePromptClick("What are your key skills?")}
          className="bg-white/5 p-4 rounded-lg text-left hover:bg-white/10 transition-colors"
        >
          <p className="font-semibold text-white">Skills</p>
          <p className="text-sm text-gray-400">
            List your technical and soft skills
          </p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-800 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 relative">
        {/* Header */}
        <header className="bg-gray-800 md:hidden flex items-center justify-between p-2 border-b border-white/20 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white p-2"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-white text-lg font-semibold">Shashank GPT</h1>
          <div className="w-8"></div> {/* Spacer */}
        </header>

        {/* Main Chat Window */}
        <main className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <InitialScreen />
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}
          {isTyping && (
            <div className="flex items-start gap-4 p-4 md:p-6 bg-gray-700/30">
              <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-indigo-500">
                <Bot size={20} className="text-white" />
              </div>
              <div className="flex-1 pt-1 flex items-center gap-2">
                <span className="typing-indicator"></span>
                <span className="typing-indicator"></span>
                <span className="typing-indicator"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Chat Input Area */}
        <footer className="bg-gray-800 p-4 md:p-6 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center bg-gray-700 text-white rounded-full p-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                rows="1"
                placeholder="Message Shashank GPT..."
                className="flex-1 bg-transparent text-white px-4 resize-none focus:outline-none"
                style={{ lineHeight: "1.5rem", maxHeight: "120px" }}
              />
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Mic size={20} />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-2 rounded-full bg-gray-500 hover:bg-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors ml-2"
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              Shashank GPT. This is a visual replica and not affiliated with
              OpenAI.
            </p>
          </div>
        </footer>
      </div>
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 md:hidden z-10"
        ></div>
      )}
      <style>{`
        .typing-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #9ca3af;
          animation: typing 1s infinite;
        }
        .typing-indicator:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-6px);
          }
        }
        textarea {
            scrollbar-width: none; /* Firefox */
        }
        textarea::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
        }
      `}</style>
    </div>
  );
};

export default App;
