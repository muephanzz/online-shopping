import { useEffect, useState } from "react";
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
  const [unreadMessages, setUnreadMessages] = useState({}); // Track unread messages

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

      // Mark messages as read
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
      <h1 className="text-3xl font-bold mb-4">Manage Chat</h1>
      <div className="flex space-x-6">
        {/* User List */}
        <div className="w-1/3 border-r p-4">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          {users.length === 0 ? (
            <p>No active users.</p>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`block w-full text-left p-2 border-b flex items-center ${
                  selectedUser === user.id ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                }`}
              >
                {user.id}
                {unreadMessages[user.id] && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Chat Section */}
        <div className="w-2/3 flex flex-col">
          {selectedUser ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Chat with {selectedUser}</h2>
              <div className="border p-4 h-96 overflow-y-auto flex flex-col">
                {messages.length === 0 ? (
                  <p>No messages yet.</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="mb-3">
                      {msg.user_message && (
                        <div className="flex justify-start">
                          <div className="p-2 bg-gray-200 rounded-lg max-w-xs">
                            {msg.user_message}
                            <p className="text-xs text-gray-500 text-right mt-1">
                              {moment(msg.created_at).format("MMMM Do YYYY, h:mm a")}
                            </p>
                          </div>
                        </div>
                      )}
                      {msg.admin_reply && (
                        <div className="flex justify-end">
                          <div className="p-2 bg-blue-500 text-white rounded-lg max-w-xs">
                            {msg.admin_reply}
                            <p className="text-xs text-white text-left mt-1">
                              {moment(msg.created_at).format("MMMM Do YYYY, h:mm a")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="flex space-x-2 mt-4">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 border p-2 rounded-lg focus:outline-none"
                />
                <button
                  onClick={handleSendReply}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a user to view their messages.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(AdminChat);
