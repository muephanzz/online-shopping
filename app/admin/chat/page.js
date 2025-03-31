"use client";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import moment from "moment";
import AdminLayout from "../../components/AdminLayout";
import withAdminAuth from "../../components/withAdminAuth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AdminChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [admin, setAdmin] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    const fetchAdmin = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) console.error("Error fetching admin:", error);
      if (user) setAdmin(user);
    };
    fetchAdmin();
  }, []);

  useEffect(() => {
    if (!admin) return;

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("user_id")
        .neq("user_id", admin.id);

      if (error) return console.error("Error fetching users:", error);

      const uniqueUserIds = [...new Set(data.map((msg) => msg.user_id))];
      const userDetails = uniqueUserIds.map((userId) => ({
        id: userId,
        email: userId,
      }));

      setUsers(userDetails);
    };

    fetchUsers();

    const channel = supabase
      .channel("admin-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          fetchUsers();
          if (!selectedUser || payload.new.user_id !== selectedUser) {
            setUnreadMessages((prev) => ({
              ...prev,
              [payload.new.user_id]: true,
            }));
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [admin, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", selectedUser)
        .order("created_at", { ascending: true });

      if (error) return console.error("Error fetching messages:", error);
      setMessages(data);

      setUnreadMessages((prev) => ({
        ...prev,
        [selectedUser]: false,
      }));
    };

    fetchMessages();

    const channel = supabase
      .channel("admin-chat-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new.user_id === selectedUser) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser]);

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedUser) return;

    const newMessage = {
      id: Date.now(),
      user_id: selectedUser,
      admin_reply: reply,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setReply("");

    const { error } = await supabase.from("messages").insert({
      user_id: selectedUser,
      admin_reply: reply,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error sending reply:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play();
  };

  return (
    <AdminLayout>
      <Suspense>
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Manage Chat</h1>
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">
        {/* User List */}
        <div className="w-full md:w-1/3 border-r bg-gray-100 p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Users</h2>
          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-gray-500">No active users.</p>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={`w-full p-3 text-left rounded-lg flex justify-between items-center transition-all ${
                    selectedUser === user.id
                      ? "bg-blue-500 text-white"
                      : "bg-white hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <span>{user.id}</span>
                  {unreadMessages[user.id] && (
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="w-full mb-20 md:w-2/3 flex flex-col">
          {selectedUser ? (
            <>
              <h2 className="text-xl font-semibold p-4 bg-blue-500 text-white rounded-t-lg">
                Chat with {selectedUser}
              </h2>

              <div className="p-4 h-[400px] overflow-y-auto flex flex-col bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-gray-500">No messages yet.</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="mb-3">
                      {msg.user_message && (
                        <div className="flex justify-start">
                          <div className="p-3 bg-gray-200 rounded-lg max-w-xs">
                            {msg.user_message}
                            <p className="text-xs text-gray-500 mt-1">
                              {moment(msg.created_at).format("h:mm A")}
                            </p>
                          </div>
                        </div>
                      )}
                      {msg.admin_reply && (
                        <div className="flex justify-end">
                          <div className="p-3 bg-blue-500 text-white rounded-lg max-w-xs">
                            {msg.admin_reply}
                            <p className="text-xs text-white mt-1">
                              {moment(msg.created_at).format("h:mm A")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t flex items-center">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 border p-3 rounded-lg focus:outline-none"
                />
                <button
                  onClick={handleSendReply}
                  className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 ml-2"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="p-4 text-gray-500">Select a user to view their messages.</p>
          )}
        </div>
      </div>
      </Suspense>
    </AdminLayout>
  );
};

export default withAdminAuth(AdminChat);