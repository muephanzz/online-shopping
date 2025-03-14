import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import AdminLayout from '../../components/AdminLayout';
import withAdminAuth from '../../components/withAdminAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AdminChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [admin, setAdmin] = useState(null);

  // Fetch admin user
  useEffect(() => {
    const getAdmin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error('Error fetching admin:', error);
      if (user) setAdmin(user);
    };
    getAdmin();
  }, []);

  // Fetch all unique users who have sent messages
  useEffect(() => {
    if (!admin) return;

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id')
        .neq('sender_id', admin.id)
        .order('created_at', { ascending: false });

      if (error) return console.error('Error fetching users:', error);

      const uniqueUsers = Array.from(new Set(data.map((msg) => msg.sender_id)));
      setUsers(uniqueUsers);
    };

    fetchUsers();

    const channel = supabase
      .channel('admin-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchUsers)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [admin]);

  // Fetch messages for the selected user
  useEffect(() => {
    if (!selectedUser || !admin) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${admin.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${admin.id})`)
        .order('created_at', { ascending: true });

      if (error) return console.error('Error fetching messages:', error);
      setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel('admin-chat-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, admin]);

  // Send admin reply to the selected user
  const handleSendReply = async () => {
    if (!reply.trim() || !selectedUser || !admin) return;

    const messagePayload = {
      sender_id: admin.id,
      receiver_id: selectedUser,
      receiver_type: 'user',
      message: reply,
      status: 'sent',
    };

    const { error } = await supabase.from('messages').insert(messagePayload);
    if (error) return console.error('Error sending message:', error);

    setReply('');
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-4">Manage Chat</h1>

      <div className="flex space-x-6">
        {/* User List */}
        <div className="w-1/3 border-r">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          {users.length === 0 ? (
            <p>No active users.</p>
          ) : (
            users.map((userId) => (
              <button
                key={userId}
                onClick={() => setSelectedUser(userId)}
                className={`block p-2 border-b ${selectedUser === userId ? 'bg-gray-200' : ''}`}
              >
                {userId}
              </button>
            ))
          )}
        </div>

        {/* Chat Messages */}
        <div className="w-2/3">
          {selectedUser ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Chat with User</h2>
              <div className="border p-4 h-96 overflow-y-auto mb-4">
                {messages.length === 0 ? (
                  <p>No messages yet.</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-2 ${msg.sender_id === admin.id ? 'text-right' : 'text-left'}`}
                    >
                      <p className={`p-2 rounded-lg inline-block ${msg.sender_id === admin.id ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                        {msg.message}
                      </p>
                      <span className="text-xs block mt-1 text-gray-500">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Input */}
              <div className="flex space-x-2">
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
            <p>Select a user to view their messages.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(AdminChat);
