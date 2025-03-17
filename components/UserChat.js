"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import moment from "moment"; // Import moment.js for formatting date/time

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const UserChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null); // Ref for click outside

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user:", error);
      if (user) setUser(user);
    };
    fetchUser();
  }, []);

  // Click outside to close chat box
  useEffect(() => {
    function handleClickOutside(event) {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) console.error("Error fetching messages:", error);
      setMessages(data || []);
    };

    fetchMessages();

    // Real-time updates
    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new.user_id === user.id) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;

    // Optimistic update (adds the message immediately)
    const newMessage = {
      id: Math.random(), // Temporary ID
      user_id: user.id,
      user_message: message,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Save message to Supabase
    const { error } = await supabase
      .from("messages")
      .insert({ user_id: user.id, user_message: message });

    if (error) console.error("Error sending message:", error);
    setMessage("");
  };

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  return (
    <div>
      {/* Draggable Chat Icon */}
      <motion.div
        drag
        dragConstraints={{ left: -6, right: 6, top: -6, bottom: 6 }}
        className="fixed bottom-20 right-6 bg-blue-500 text-white p-3 rounded-full cursor-pointer shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare size={28} />
      </motion.div>

      {/* Chat Box */}
      {isOpen && (
        <motion.div
          ref={chatRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-20 right-0 w-72 bg-white border shadow-lg rounded-lg"
        >
          <div className="p-3 border-b bg-blue-500 text-white flex justify-between">
            <span>Chat with an agent</span>
            <button onClick={() => setIsOpen(false)} className="text-white text-xl">&times;</button>
          </div>

          <div className="p-3 h-64 overflow-y-auto flex flex-col">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="mb-2">
                  {msg.user_message && (
                    <div className="flex justify-end">
                      <div className="p-2 bg-gray-200 rounded-lg max-w-xs">
                        {msg.user_message}
                        <p className="text-xs text-gray-500 text-right mt-1">
                          {moment(msg.created_at).format("hh:mm A - MMM D")}
                        </p>
                      </div>
                    </div>
                  )}

                  {msg.admin_reply && (
                    <div className="flex justify-start">
                      <div className="p-2 bg-blue-500 text-white rounded-lg max-w-xs">
                        {msg.admin_reply}
                        <p className="text-xs text-white text-left mt-1">
                          {moment(msg.created_at).format("hh:mm A - MMM D")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex space-x-2 p-3 border-t">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 w-3/4 border p-2 rounded-lg focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserChat;
