"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { MessageCircle } from "lucide-react";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const UnifiedChat = () => {
  const [user, setUser] = useState(null);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Check if user is an admin
      if (user) {
        const { data: adminData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setIsAdmin(adminData?.role === "admin");
      }
    };
    fetchUser();
  }, []);

  // Fetch messages
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching messages:", error);
    else setMessages(data);
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!userMessage.trim() || !user) return;

    const newMessage = {
      sender_id: user.id,
      recipient_id: isAdmin ? "user" : "bot",
      message: userMessage,
      status: "sent",
    };

    // Insert user's message
    const { error } = await supabase.from("messages").insert([newMessage]);
    if (error) return console.error("Error sending message:", error);

    setMessages((prev) => [...prev, newMessage]);
    setUserMessage("");
    setIsTyping(true);

    // If user, send message to chatbot
    if (!isAdmin) {
      try {
        const { data } = await axios.post("/api/chatbot", { userMessage });
        const botResponse = {
          sender_id: "bot",
          recipient_id: user.id,
          message: data.botResponse || "Sorry, I couldn't understand.",
          status: "delivered",
        };
        await supabase.from("messages").insert([botResponse]);
      } catch (error) {
        console.error("Chatbot API error:", error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  // Mark message as seen
  const markMessageAsSeen = async (messageId) => {
    await supabase
      .from("messages")
      .update({ status: "seen" })
      .eq("id", messageId);
  };

  // Real-time message listener
  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          if (payload.new.sender_id !== user?.id) {
            markMessageAsSeen(payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  // Hide chat if no user is logged in
  if (!user) return null;

  return (
    <div>
      {/* Chat Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-8 w-96 p-4 bg-white shadow-xl rounded-lg border border-gray-300">
          {/* Chat Header */}
          <div className="font-bold text-lg mb-4 flex justify-between items-center">
            <span>{isAdmin ? "Admin Chat" : "Live Chat"}</span>
            <button onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto mb-4 space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender_id === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 max-w-xs rounded-lg ${
                    msg.sender_id === user?.id
                      ? "bg-blue-500 text-white"
                      : msg.sender_id === "bot"
                      ? "bg-gray-300"
                      : "bg-green-500 text-white"
                  }`}
                >
                  <p>{msg.message}</p>
                  <span className="text-xs block mt-1">{msg.status}</span>
                </div>
              </div>
            ))}
            {isTyping && <div className="text-gray-500">Bot is typing...</div>}
          </div>

          {/* Message Input */}
          <div className="flex items-center">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder={isAdmin ? "Reply to user..." : "Type your message..."}
              className="flex-grow p-2 border rounded-lg focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedChat;
