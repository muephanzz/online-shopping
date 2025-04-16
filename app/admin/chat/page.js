"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import moment from "moment";
import AdminLayout from "@/components/AdminLayout";

const AdminChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      const { data } = await supabase
        .from("messages")
        .select("user_id, created_at")
        .order("created_at", { ascending: false });
      const grouped = [...new Set(data.map((m) => m.user_id))];
      setConversations(grouped);
    };
    fetchConversations();
  }, []);

  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (!selectedUserId) return;
    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", selectedUserId)
        .order("created_at");
      setMessages(data);
    };
    load();
  }, [selectedUserId]);

  const sendReply = async () => {
    await supabase.from("messages").insert({
      user_id: selectedUserId,
      admin_reply: reply,
    });
    setReply("");
  };

  return (
    <AdminLayout>
<h1 className="text-3xl font-bold mb-6">Manage Chats</h1>

    <div className="p-4 flex">
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
      <div className="w-3/4 pl-4">
        <h2 className="font-bold mb-2">Conversation</h2>
        <div className="h-80 overflow-y-auto bg-gray-100 p-3 rounded mb-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`mb-2 ${msg.admin_reply ? "text-right" : "text-left"}`}>
              <div className={`inline-block p-2 rounded-lg max-w-[70%] ${msg.admin_reply ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                {msg.admin_reply || msg.user_message}
                <div className="text-xs mt-1 text-gray-300">
                  {moment(msg.created_at).format("MMM Do h:mm a")}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="flex-1 border rounded p-2"
            placeholder="Reply..."
          />
          <button
            onClick={sendReply}
            className="bg-blue-600 text-white px-4 py-2 rounded"
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
