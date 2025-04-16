"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import moment from "moment";
import AdminLayout from "@/components/AdminLayout";

const AdminChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [reply, setReply] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch all unique users who have messaged
  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("user_id, created_at")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching messages:", error);

      const grouped = [...new Set(data?.map((m) => m.user_id))];
      setConversations(grouped);
    };

    fetchConversations();
  }, []);

  // Fetch messages for the selected user
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", selectedUserId)
        .order("created_at");

      if (error) console.error("Error fetching chat:", error);
      else setMessages(data);
    };

    fetchMessages();

    // Real-time updates
    const channel = supabase
      .channel("messages-listener")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `user_id=eq.${selectedUserId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUserId]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    const { error } = await supabase.from("messages").insert({
      user_id: selectedUserId,
      admin_reply: reply.trim(),
    });
    if (error) console.error("Error sending reply:", error);
    setReply("");
  };

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Manage Chats</h1>
      <div className="p-4 flex">
        {/* User List */}
        <div className="w-1/4 border-r pr-4">
          <h2 className="font-bold text-lg mb-4">Users</h2>
          {conversations.map((id) => (
            <div
              key={id}
              onClick={() => setSelectedUserId(id)}
              className={`cursor-pointer p-2 rounded ${
                selectedUserId === id ? "bg-blue-200" : "hover:bg-gray-100"
              }`}
            >
              {id}
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="w-3/4 pl-4 flex flex-col">
          <h2 className="font-bold mb-2">Conversation</h2>
          <div className="h-80 overflow-y-auto bg-gray-100 p-3 rounded mb-3 flex-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 ${msg.admin_reply ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block p-2 rounded-lg max-w-[70%] ${
                    msg.admin_reply ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  {msg.admin_reply || msg.user_message}
                  <div className="text-xs mt-1 text-gray-300">
                    {moment(msg.created_at || new Date()).format("MMM Do h:mm a")}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="flex-1 border rounded p-2"
              placeholder="Reply..."
            />
            <button
              onClick={sendReply}
              disabled={!reply.trim()}
              className={`px-4 py-2 rounded text-white ${
                reply.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChat;
