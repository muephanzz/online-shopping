"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { MessageSquare, ImageIcon } from "lucide-react";
import moment from "moment";

const UserChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState(false);
  const [image, setImage] = useState(null); // For image upload
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
      const checkMobile = () => {
        setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
      };
      checkMobile();
    }, []);

  if (isMobile) return null;
  
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
    if (!message.trim() && !image && !isTyping) return;

    const newMessageData = { user_id: user.id, user_message: message };

    if (image) {
      newMessageData["image_url"] = image;
    }

    await supabase.from("messages").insert(newMessageData);
    setMessage("");
    setImage(null); // Clear image after sending
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulating an image upload (replace with your own upload logic)
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    setIsTyping(true);

    // Stop typing indicator after 2 seconds of inactivity
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => setIsTyping(false), 2000);
  };

  let typingTimeout = null;

  return (
    <div>
      {/* Chat Icon Button */}
      <motion.div
        drag
        dragConstraints={{ left: -6, right: 6, top: -6, bottom: 6 }}
        className="fixed z-900 bottom-12 right-6 bg-gradient-to-r from-blue-500 via-teal-400 to-indigo-500 text-white p-3 rounded-full cursor-pointer shadow-xl transform hover:scale-105 transition-all"
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

      {/* Chat Window */}
      {isOpen && (
        <motion.div
          ref={chatRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-12 right-0 w-80 max-w-xs bg-white border rounded-lg shadow-lg border-gray-300"
        >
          <div className="p-3 bg-gradient-to-r from-blue-500 via-teal-400 to-indigo-500 text-white flex justify-between items-center rounded-t-lg">
            <span className="font-bold text-lg">Chat with Support</span>
            <button onClick={() => setIsOpen(false)} className="text-white text-xl">
              &times;
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-3 h-64 overflow-y-auto flex flex-col bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-3 ${msg.admin_reply ? "text-left" : "text-right"}`}>
                <div className="flex items-start">
                  {/* User/Admin Avatar */}
                  <img
                    src={msg.user_id === user.id ? user.avatar_url : "/admin-avatar.png"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div
                    className={`inline-block p-3 rounded-xl max-w-[75%] ${msg.admin_reply ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                  >
                    <p>{msg.admin_reply || msg.user_message}</p>
                    {msg.image_url && (
                      <img src={msg.image_url} alt="uploaded" className="mt-2 w-32 h-32 object-cover rounded-md" />
                    )}
                    <div className="text-xs mt-1 text-gray-400 text-right">
                      {moment(msg.created_at).format("h:mm A")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Send Button */}
          <div className="flex space-x-2 p-3 bg-gray-100 border-t rounded-b-lg">
            <textarea
              value={message}
              onChange={handleTyping}
              className="flex-1 w-3/4 overflow-hidden border border-gray-300 p-2 rounded-lg text-gray-800"
              placeholder="Type a message"
            />
            {/* Image Upload */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer justify[-center">
              <ImageIcon size={24} className="text-blue-500" />
            </label>

            <button
              onClick={sendMessage}
              className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${!message.trim() && !image ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
              disabled={!message.trim() && !image}
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
