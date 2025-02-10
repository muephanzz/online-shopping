import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/signin');
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    getUserProfile();
  }, [router]);

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
    } else {
      alert('Profile updated successfully!');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card>
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">Profile</h1>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <Input
              type="text"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <Input
              type="text"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input type="email" value={profile.email} disabled />
          </div>

          <Button className="w-full mb-2" onClick={handleUpdate} disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>

          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
