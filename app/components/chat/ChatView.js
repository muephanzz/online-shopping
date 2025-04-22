"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { MessageSquare, ImageIcon, ArrowLeft } from "lucide-react";
import moment from "moment";

const UserChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState(false);
  const [image, setImage] = useState(null);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    getUser();
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
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
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
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, isOpen]);

  const sendMessage = async () => {
    if (!message.trim() && !image) return;
    const newMessageData = { user_id: user.id, user_message: message };
    if (image) newMessageData["image_url"] = image;
    await supabase.from("messages").insert(newMessageData);
    setMessage("");
    setImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTyping = (e) => setMessage(e.target.value);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ChatWindow = () => (
    <motion.div
      ref={chatRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`fixed bottom-0 ${isMobile ? "inset-0" : "right-4 w-96"} bg-white border border-gray-300 shadow-lg flex flex-col h-[80%] max-h-[600px] rounded-t-lg`}
    >
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600 text-white p-4">
        <div className="flex items-center gap-2">
          {isMobile && (
            <button onClick={() => setIsOpen(false)} className="text-white">
              <ArrowLeft size={20} />
            </button>
          )}
          <span className="font-bold text-lg">Chat with Support</span>
        </div>
        {!isMobile && (
          <button onClick={() => setIsOpen(false)} className="text-white text-xl">
            &times;
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.admin_reply ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`rounded-xl p-3 shadow-md max-w-[80%] ${msg.admin_reply ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
            >
              <p>{msg.admin_reply || msg.user_message}</p>
              {msg.image_url && (
                <img
                  src={msg.image_url}
                  alt="media"
                  className="mt-2 w-full h-40 object-cover rounded-lg"
                />
              )}
              <div className="text-xs text-gray-200 mt-1 text-right">
                {moment(msg.created_at).format("h:mm A")}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-gray-100 border-t flex gap-2">
        <textarea
          value={message}
          onChange={handleTyping}
          placeholder="Type your message..."
          className="flex-1 resize-none rounded-lg p-2 border border-gray-300 focus:outline-none"
        />
        <input
          type="file"
          accept="image/*"
          id="upload-image"
          onChange={handleImageUpload}
          className="hidden"
        />
        <label htmlFor="upload-image" className="cursor-pointer">
          <ImageIcon size={24} className="text-blue-500" />
        </label>
        <button
          onClick={sendMessage}
          disabled={!message.trim() && !image}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </motion.div>
  );

  return (
    <div>
      {!isMobile && (
        <motion.div
          drag
          dragConstraints={{ left: -6, right: 6, top: -6, bottom: 6 }}
          className="fixed z-50 bottom-12 right-6 bg-gradient-to-r from-blue-500 via-teal-400 to-indigo-500 text-white p-3 rounded-full cursor-pointer shadow-xl hover:scale-105 transition"
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
      )}
      {isOpen && <ChatWindow />}
    </div>
  );
};

export default UserChat;
