import React, { useState } from "react";
import { Chatbot } from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import "../styles/ChatBot.css"; // Import chatbot styles
import { BsChatDots } from "react-icons/bs";

// Configuration for chatbot
const config = {
  initialMessages: [
    {
      type: "text",
      text: "Hello! How can I help you with graph algorithms? You can ask about Prim's, Kruskal's, or Dijkstra's algorithms.",
    },
  ],
  renderChatHeader: () => <div className="chatbot-header">Graphify Chatbot</div>,
};

// Action Provider - Defines responses to user inputs
class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handlePrimAlgorithm = () => {
    const message = this.createChatBotMessage(
      "Prim's Algorithm is a greedy algorithm used to find the Minimum Spanning Tree (MST) of a weighted graph. It starts from any node and expands by adding the smallest edge."
    );
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  handleKruskalAlgorithm = () => {
    const message = this.createChatBotMessage(
      "Kruskal's Algorithm is a greedy algorithm that finds the MST by sorting all edges in increasing order and adding them one by one while avoiding cycles."
    );
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  handleDijkstraAlgorithm = () => {
    const message = this.createChatBotMessage(
      "Dijkstra's Algorithm finds the shortest path from a source node to all other nodes in a weighted graph using a priority queue."
    );
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };
}

// Message Parser - Parses user messages and triggers appropriate action
class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("prim")) {
      this.actionProvider.handlePrimAlgorithm();
    } else if (lowerCaseMessage.includes("kruskal")) {
      this.actionProvider.handleKruskalAlgorithm();
    } else if (lowerCaseMessage.includes("dijkstra")) {
      this.actionProvider.handleDijkstraAlgorithm();
    } else {
      const fallbackMessage = this.actionProvider.createChatBotMessage(
        "I can help you with Prim's, Kruskal's, and Dijkstra's algorithms. Please ask about one of these!"
      );
      this.actionProvider.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, fallbackMessage],
      }));
    }
  }
}

// Chatbot Component with Floating Button
const ChatbotComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chatbot Button */}
      <button className="chatbot-button" onClick={() => setIsOpen(!isOpen)}>
        <BsChatDots size={24} color="white" />
      </button>

      {/* Chatbot UI */}
      <div className={`chatbot-container ${isOpen ? "chatbot-visible" : ""}`}>
        <div className="chatbot-header">
          Graphify Chatbot
          <span className="chatbot-close" onClick={() => setIsOpen(false)}>✖</span>
        </div>
        <div className="chatbot-body">
          <Chatbot config={config} actionProvider={ActionProvider} messageParser={MessageParser} />
        </div>
      </div>
    </>
  );
};

export default ChatbotComponent;
