"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminChat() {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      setChats(data || []);
    };
    fetchMessages();
  }, []);

  const handleReply = async (id, reply) => {
    await supabase.from("messages").update({ admin_reply: reply }).eq("id", id);
    setChats((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, admin_reply: reply } : msg))
    );
  };

  return (
    <div className="p-6 space-y-4">
      {chats.map((msg) => (
        <div key={msg.id} className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">From User ID: {msg.user_id}</p>
          <p className="mb-2">{msg.user_message}</p>
          {msg.image_url && (
            <img src={msg.image_url} className="w-32 h-32 object-cover rounded-md mb-2" />
          )}
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Reply here..."
            value={msg.admin_reply || ""}
            onChange={(e) => handleReply(msg.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
