"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import moment from "moment";

const UserChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };

    loadMessages();

    const channel = supabase
      .channel("realtime:messages")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const msg = payload.new;
        if (msg.user_id === user.id) {
          setMessages((prev) => [...prev, msg]);
          if (!isOpen && msg.admin_reply) {
            new Notification("New reply", {
              body: msg.admin_reply,
              icon: "/chat-icon.png",
            });
            setNewMessage(true);
            new Audio("/notification.mp3").play().catch(() => {});
          }
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, isOpen]);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;
    await supabase.from("messages").insert({
      user_id: user.id,
      user_message: message,
    });
    setMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      <motion.div
        drag
        dragConstraints={{ left: -6, right: 6, top: -6, bottom: 6 }}
        className="fixed bottom-20 right-6 bg-blue-500 text-white p-3 rounded-full cursor-pointer shadow-lg"
        onClick={() => {
          setIsOpen(!isOpen);
          setNewMessage(false);
        }}
      >
        <MessageSquare size={28} />
        {newMessage && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            !
          </span>
        )}
      </motion.div>

      {isOpen && (
        <motion.div
          ref={chatRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-20 right-0 w-72 bg-white border shadow-lg rounded-lg"
        >
          <div className="p-3 border-b bg-blue-500 text-white flex justify-between">
            <span>Chat with Support</span>
            <button onClick={() => setIsOpen(false)} className="text-white">&times;</button>
          </div>

          <div className="p-3 h-64 overflow-y-auto flex flex-col">
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-2 ${msg.admin_reply ? "text-left" : "text-right"}`}>
                <div
                  className={`inline-block p-2 rounded-lg max-w-[75%] ${
                    msg.admin_reply ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.admin_reply || msg.user_message}
                  <div className="text-xs mt-1 text-gray-400 text-right">
                    {moment(msg.created_at).format("h:mm A")}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex space-x-2 p-3 border-t">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border p-2 rounded-lg"
              placeholder="Type a message"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg"
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
