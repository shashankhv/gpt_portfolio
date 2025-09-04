"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  Plus,
  MessageSquare,
  MoreHorizontal,
  Send,
  User,
  Bot,
  X,
  Menu,
  Github,
  Linkedin,
  FileText,
  Briefcase,
  Mail,
  Sun,
  Moon,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

// Main App Component
const App = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // State for managing sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for chat messages
  const [messages, setMessages] = useState([]);

  // State for the current input value
  const [inputValue, setInputValue] = useState("");

  // State to indicate if the bot is "thinking"
  const [isTyping, setIsTyping] = useState(false);

  // State for streaming response
  const [streamingResponse, setStreamingResponse] = useState("");

  // Cache for common responses
  const [responseCache, setResponseCache] = useState({});

  // Predefined responses for common questions
  const predefinedResponses = {
    experience:
      "I'm a passionate software developer with extensive experience in full-stack development, AI/ML, and cloud technologies. I specialize in building scalable web applications using modern frameworks like React, Node.js, and Python. I've worked on various projects ranging from e-commerce platforms to AI-powered applications. You can find more details about my professional journey on my LinkedIn profile in the sidebar.",

    education:
      "I have a strong educational background in Computer Science with a focus on software engineering and artificial intelligence. I'm proficient in multiple programming languages including JavaScript, Python, Java, and C++. I've also completed various certifications in cloud computing and machine learning. My GitHub repositories showcase my technical skills and project work - feel free to explore them!",

    about:
      "I'm a dedicated software developer who loves creating innovative technology solutions. I'm passionate about solving complex problems and building applications that make a real difference. I enjoy working with cutting-edge technologies and am always eager to learn new skills. When I'm not coding, I love contributing to open-source projects and sharing knowledge with the developer community.",

    projects:
      "I've worked on numerous exciting projects throughout my career! From full-stack web applications to AI/ML models, I love building solutions that solve real-world problems. Some of my notable projects include e-commerce platforms, data visualization tools, and machine learning applications. Check out my GitHub profile in the sidebar to explore my repositories and see detailed project documentation.",

    skills:
      "My technical skills span across multiple domains: Frontend (React, Vue.js, HTML/CSS, JavaScript/TypeScript), Backend (Node.js, Python, Java, Express.js), Databases (PostgreSQL, MongoDB, Redis), Cloud (AWS, Google Cloud, Docker), and AI/ML (TensorFlow, PyTorch, scikit-learn). I'm also experienced with DevOps practices, version control, and agile development methodologies.",

    contact:
      "I'd love to connect with you! You can reach me through the contact information in the sidebar. Feel free to check out my LinkedIn for professional networking, or explore my GitHub to see my latest work. I'm always open to discussing new opportunities, collaborations, or just having a chat about technology!",
  };

  // Ref for the end of the messages list to enable auto-scrolling
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect to scroll to the latest message whenever the messages array updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, streamingResponse]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [inputValue]);

  // Function to clean response content
  const cleanResponseContent = (content) => {
    if (!content) return content;
    
    // Only remove obvious streaming artifacts, be very conservative
    // Remove raw JSON objects that are clearly streaming metadata
    content = content.replace(/\{[^}]*"id"[^}]*"object"[^}]*\}/g, '');
    content = content.replace(/\{[^}]*"created"[^}]*"model"[^}]*\}/g, '');
    
    return content;
  };

  // Function to check for cached or predefined responses
  const getCachedResponse = (input, isButtonClick = false) => {
    const lowerInput = input.toLowerCase();

    // Only check predefined responses for button clicks
    if (isButtonClick) {
      // Check for exact matches in predefined responses
      for (const [key, response] of Object.entries(predefinedResponses)) {
        if (lowerInput.includes(key)) {
          return response;
        }
      }
    }

    // Check cache for exact matches only (not partial word matches)
    const cacheKey = lowerInput.replace(/[^\w\s]/g, "").trim();
    if (responseCache[cacheKey]) {
      return responseCache[cacheKey];
    }

    return null;
  };

  // Function to handle sending a message with streaming
  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);
    setStreamingResponse("");

    // Check for cached response only (no predefined responses for manual input)
    const cachedResponse = getCachedResponse(currentInput, false);
    if (cachedResponse) {
      // Simulate typing delay for better UX
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: cachedResponse,
          sender: "bot",
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // Use the shared API call function
    handleApiCall(currentInput);
  };

  // Handle key press for sending message with Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (promptText) => {
    // Automatically send the predefined query
    const userMessage = {
      id: Date.now(),
      text: promptText,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsTyping(true);
    setStreamingResponse("");

    // Check for cached/predefined response first (button click)
    const cachedResponse = getCachedResponse(promptText, true);
    if (cachedResponse) {
      // Simulate typing delay for better UX
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: cachedResponse,
          sender: "bot",
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // If no cached response, make API call
    handleApiCall(promptText);
  };

  // Extract API call logic into separate function
  const handleApiCall = async (messageText) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            // Add conversation history
            ...messages.slice(-10).map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            // Add current message
            {
              role: "user",
              content: messageText,
            },
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (
          response.status === 500 &&
          errorData.error?.includes("API key not configured")
        ) {
          throw new Error(
            "API key not configured. Please set CLONE_KEY in your environment variables."
          );
        }
        if (response.status === 403) {
          throw new Error(
            "API authentication failed. Please check your API key."
          );
        }
        throw new Error(`Server error: ${errorData.error || response.status}`);
      }

      // Handle streaming response - simplified approach
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim() && line.startsWith("data: ")) {
            const dataContent = line.slice(6).trim();

            // Skip [DONE] markers
            if (dataContent === "[DONE]") {
              continue;
            }

            try {
              const data = JSON.parse(dataContent);
              
              // Simple extraction like the Python example
              if (data.choices && data.choices.length > 0) {
                const content = data.choices[0].delta?.content || '';
                if (content) {
                  fullResponse += content;
                  setStreamingResponse(fullResponse);
                }
              }
            } catch (e) {
              // Skip malformed JSON
              continue;
            }
          }
        }
      }

      // Add the complete response to messages
      const botResponse = {
        id: Date.now() + 1,
        text:
          fullResponse ||
          "I received your message but couldn't generate a response. Please try again.",
        sender: "bot",
      };

      setMessages((prevMessages) => [...prevMessages, botResponse]);
      setStreamingResponse("");

      // Cache the response for future use
      const cacheKey = messageText
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();
      setResponseCache((prev) => ({
        ...prev,
        [cacheKey]: fullResponse,
      }));
    } catch (error) {
      console.error("Error:", error);

      // Provide a fallback response based on the user's question
      let fallbackResponse =
        "I'm Shashank's AI digital clone! I'd love to chat with you, but I'm currently experiencing some technical difficulties. ";

      // Add specific error information for debugging
      if (error.message.includes("API key not configured")) {
        fallbackResponse += "The API key needs to be configured. ";
      } else if (error.message.includes("authentication failed")) {
        fallbackResponse +=
          "There's an authentication issue with the AI service. ";
      }

      // Simple keyword-based fallback responses
      const lowerInput = messageText.toLowerCase();
      if (
        lowerInput.includes("experience") ||
        lowerInput.includes("background") ||
        lowerInput.includes("work")
      ) {
        fallbackResponse +=
          "I can tell you about my professional experience! I'm a passionate developer with expertise in full-stack development, AI/ML, and cloud technologies. Check out my LinkedIn profile in the sidebar for detailed work history, or explore my GitHub for my latest projects.";
      } else if (
        lowerInput.includes("education") ||
        lowerInput.includes("skills") ||
        lowerInput.includes("qualification")
      ) {
        fallbackResponse +=
          "I have a strong educational background in computer science and extensive experience with modern technologies including React, Node.js, Python, and cloud platforms. You can find more details in my resume link in the sidebar, or browse my GitHub repositories to see my technical skills in action.";
      } else if (
        lowerInput.includes("project") ||
        lowerInput.includes("portfolio") ||
        lowerInput.includes("github")
      ) {
        fallbackResponse +=
          "I've worked on numerous exciting projects! From web applications to AI models, I love building innovative solutions. Check out my GitHub profile in the sidebar to explore my repositories, or visit my projects page to see detailed case studies.";
      } else if (
        lowerInput.includes("about") ||
        lowerInput.includes("yourself") ||
        lowerInput.includes("who")
      ) {
        fallbackResponse +=
          "I'm a dedicated software developer passionate about creating impactful technology solutions. I specialize in full-stack development, AI/ML, and cloud computing. I love solving complex problems and building applications that make a difference. Feel free to explore my portfolio links in the sidebar to learn more about my work!";
      } else {
        fallbackResponse +=
          "Feel free to ask me about my experience, projects, skills, or anything else! You can also explore my portfolio through the links in the sidebar - check out my GitHub, LinkedIn, resume, and projects.";
      }

      const errorResponse = {
        id: Date.now() + 1,
        text: fallbackResponse,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to start a new chat
  const handleNewChat = () => {
    setMessages([]);
    setStreamingResponse("");
    setIsTyping(false);
    setInputValue("");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Theme toggle component
  const ThemeToggle = () => {
    if (!mounted) return null;

    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun size={20} className="text-gray-600 dark:text-gray-300" />
        ) : (
          <Moon size={20} className="text-gray-600 dark:text-gray-300" />
        )}
      </button>
    );
  };

  // Sidebar Component
  const Sidebar = () => (
    <aside
      className={`bg-sidebar-bg text-sidebar-text absolute md:relative w-64 h-full flex flex-col transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out z-20`}
    >
      <div className="flex-1 p-2">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-sm hover:bg-sidebar-hover transition-colors mb-4 border border-sidebar-border"
        >
          <Plus size={18} /> New chat
        </button>

        <div className="flex flex-col gap-1 mb-4">
          {/* Portfolio Links */}
          <div className="text-xs font-medium text-sidebar-text/60 uppercase tracking-wide mb-2 px-3">
            Portfolio
          </div>

          <a
            href="https://github.com/shashankhv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg text-sm hover:bg-sidebar-hover transition-colors group"
          >
            <Github size={18} />
            <span>GitHub</span>
            <ExternalLink
              size={14}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </a>

          <a
            href="https://linkedin.com/in/shashankhv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg text-sm hover:bg-sidebar-hover transition-colors group"
          >
            <Linkedin size={18} />
            <span>LinkedIn</span>
            <ExternalLink
              size={14}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </a>

          <a
            href="/resume"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg text-sm hover:bg-sidebar-hover transition-colors group"
          >
            <FileText size={18} />
            <span>Resume</span>
            <ExternalLink
              size={14}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </a>

          <a
            href="/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg text-sm hover:bg-sidebar-hover transition-colors group"
          >
            <Briefcase size={18} />
            <span>Projects</span>
            <ExternalLink
              size={14}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </a>

          <a
            href="mailto:shashank.halanur@gmail.com"
            className="flex items-center gap-3 p-3 rounded-lg text-sm hover:bg-sidebar-hover transition-colors group"
          >
            <Mail size={18} />
            <span>Contact</span>
          </a>
        </div>

        <div className="flex flex-col gap-1">
          {/* Recent conversations placeholder */}
          <div className="text-xs font-medium text-sidebar-text/60 uppercase tracking-wide mb-2 px-3">
            Recent
          </div>

          {messages.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-sidebar-hover cursor-pointer">
              <div className="flex items-center gap-3">
                <MessageSquare size={16} />
                <span className="text-sm truncate">Current Chat</span>
              </div>
              <MoreHorizontal size={16} />
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  // Chat Message Component
  const ChatMessage = ({ message }) => {
    const [copied, setCopied] = useState(false);
    const isBot = message.sender === "bot";

    const handleCopy = () => {
      copyToClipboard(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="group">
        <div
          className={`flex items-start gap-4 p-4 md:p-6 max-w-4xl mx-auto ${
            isBot ? "justify-start" : "justify-end"
          }`}
        >
          {isBot && (
            <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-accent-green">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}

          <div className={`flex-1 max-w-2xl ${isBot ? "order-2" : "order-1"}`}>
            <div
              className={`flex items-start gap-2 ${
                isBot ? "justify-start" : "justify-end"
              }`}
            >
              {!isBot && (
                <button
                  onClick={handleCopy}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Copy message"
                >
                  {copied ? (
                    <Check size={16} className="text-accent-green" />
                  ) : (
                    <Copy size={16} className="text-text-tertiary" />
                  )}
                </button>
              )}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  isBot
                    ? "bg-bg-secondary text-text-primary"
                    : "bg-accent-blue text-white"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </p>
              </div>
              {isBot && (
                <button
                  onClick={handleCopy}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Copy message"
                >
                  {copied ? (
                    <Check size={16} className="text-accent-green" />
                  ) : (
                    <Copy size={16} className="text-text-tertiary" />
                  )}
                </button>
              )}
            </div>
          </div>

          {!isBot && (
            <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-accent-blue order-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Streaming message component
  const StreamingMessage = () => {
    if (!isTyping && !streamingResponse) return null;

    return (
      <div className="group">
        <div className="flex items-start gap-4 p-4 md:p-6 max-w-4xl mx-auto justify-start">
          <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-accent-green">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="flex-1 max-w-2xl order-2">
            <div className="flex items-start gap-2 justify-start">
              <div className="rounded-2xl px-4 py-3 bg-bg-secondary text-text-primary">
                {streamingResponse ? (
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {streamingResponse}
                    <span className="inline-block w-2 h-5 bg-accent-green ml-1 animate-pulse"></span>
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Initial screen with prompt suggestions
  const InitialScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-accent-green/10 rounded-full mb-6">
          <Bot size={48} className="text-accent-green" />
        </div>
        <h1 className="text-4xl font-semibold text-text-primary mb-2">
          How can I help you today?
        </h1>
        <p className="text-text-secondary">
          I'm Shashank's AI digital clone. Ask me anything!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        <button
          onClick={() =>
            handlePromptClick("Tell me about your experience and background")
          }
          className="bg-bg-secondary p-6 rounded-xl text-left hover:bg-bg-tertiary transition-colors border border-border-light"
        >
          <div className="flex items-center gap-3 mb-2">
            <Briefcase size={20} className="text-accent-green" />
            <p className="font-medium text-text-primary">
              Professional Experience
            </p>
          </div>
          <p className="text-sm text-text-secondary">
            Learn about my work history, skills, and achievements
          </p>
        </button>

        <button
          onClick={() =>
            handlePromptClick(
              "What is your educational background and qualifications?"
            )
          }
          className="bg-bg-secondary p-6 rounded-xl text-left hover:bg-bg-tertiary transition-colors border border-border-light"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText size={20} className="text-accent-green" />
            <p className="font-medium text-text-primary">Education & Skills</p>
          </div>
          <p className="text-sm text-text-secondary">
            Discover my academic journey and technical expertise
          </p>
        </button>

        <button
          onClick={() =>
            handlePromptClick("Tell me about yourself and your interests")
          }
          className="bg-bg-secondary p-6 rounded-xl text-left hover:bg-bg-tertiary transition-colors border border-border-light"
        >
          <div className="flex items-center gap-3 mb-2">
            <User size={20} className="text-accent-green" />
            <p className="font-medium text-text-primary">About Me</p>
          </div>
          <p className="text-sm text-text-secondary">
            Get to know me personally and professionally
          </p>
        </button>

        <button
          onClick={() => handlePromptClick("What projects have you worked on?")}
          className="bg-bg-secondary p-6 rounded-xl text-left hover:bg-bg-tertiary transition-colors border border-border-light"
        >
          <div className="flex items-center gap-3 mb-2">
            <Github size={20} className="text-accent-green" />
            <p className="font-medium text-text-primary">
              Projects & Portfolio
            </p>
          </div>
          <p className="text-sm text-text-secondary">
            Explore my coding projects and technical work
          </p>
        </button>
      </div>
    </div>
  );

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="flex h-screen bg-bg-primary font-sans">
      <Sidebar />

      <div className="flex flex-col flex-1 relative">
        {/* Header */}
        <header className="bg-bg-primary md:hidden flex items-center justify-between p-4 border-b border-border-light z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-text-primary p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-text-primary text-lg font-semibold">
            Shashank GPT
          </h1>
          <ThemeToggle />
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-4 border-b border-border-light">
          <h1 className="text-text-primary text-lg font-semibold">
            Shashank GPT
          </h1>
          <ThemeToggle />
        </header>

        {/* Main Chat Window */}
        <main className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <InitialScreen />
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <StreamingMessage />
            </>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Chat Input Area */}
        <footer className="bg-bg-primary p-4 md:p-6 border-t border-border-light">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-input-bg border border-input-border rounded-2xl focus-within:border-input-focus transition-colors">
              <div className="flex items-end p-3">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                  placeholder="Message Shashank GPT..."
                  className="flex-1 bg-transparent text-text-primary resize-none focus:outline-none min-h-[24px] max-h-[120px] pr-3"
                  style={{ lineHeight: "16px" }}
                />
                <div className="flex-shrink-0">
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="w-8 h-8 rounded-lg bg-accent-green hover:bg-accent-green-hover disabled:bg-text-tertiary disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Send size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-text-tertiary mt-3">
              Shashank GPT can make mistakes. Consider checking important
              information.
            </p>
          </div>
        </footer>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 md:hidden z-10"
        />
      )}
    </div>
  );
};

export default App;
