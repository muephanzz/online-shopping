import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import AdminLayout from '../../components/AdminLayout';
import withAdminAuth from '../../components/withAdminAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AdminChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const getAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setAdmin(user);
    };
    getAdmin();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data } = await supabase
        .from('messages')
        .select('sender_id')
        .neq('sender_id', admin?.id)
        .order('created_at', { ascending: false });

      if (data) {
        const uniqueUsers = [...new Set(data.map((msg) => msg.sender_id))];
        setConversations(uniqueUsers);
      }
    };

    fetchConversations();

    const channel = supabase
      .channel('admin-chat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [admin]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${selectedUser},recipient_id.eq.${selectedUser}`)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();
  }, [selectedUser]);

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedUser) return;

    await supabase.from('messages').insert({
      sender_id: admin.id,
      recipient_id: selectedUser,
      message: reply,
      status: 'sent',
    });

    setReply('');
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-4">Manage Chat</h1>

      <div className="flex space-x-6">
        <div className="w-1/3 border-r">
          <h2 className="text-xl font-semibold mb-4">Conversations</h2>
          {conversations.map((userId) => (
            <button
              key={userId}
              onClick={() => setSelectedUser(userId)}
              className={`block p-2 border-b ${selectedUser === userId ? 'bg-gray-200' : ''}`}
            >
              {userId}
            </button>
          ))}
        </div>

        <div className="w-2/3">
          {selectedUser ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Chat with User</h2>
              <div className="border p-4 h-96 overflow-y-auto mb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`mb-2 ${msg.sender_id === admin.id ? 'text-right' : 'text-left'}`}>
                    <p className="p-2 rounded bg-gray-100 inline-block">{msg.message}</p>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 border p-2"
                />
                <button
                  onClick={handleSendReply}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p>Select a conversation to start chatting.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(AdminChat);
