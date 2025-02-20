import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar_url: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/auth/signin');
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, avatar_url')
        .eq('user_id', user.id)
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
    // Check if required fields are filled
    if (!profile.first_name.trim() || !profile.last_name.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
  
    setLoading(true);
  
    let avatar_url = profile.avatar_url;
  
    // If a new image is selected, upload it to Supabase Storage
    if (avatar) {
      const fileExt = avatar.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
  
      // Upload the file
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatar, { upsert: true });
  
      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        setLoading(false);
        return;
      }
  
      // Get the public URL of the uploaded image
      const { data: publicURLData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
  
      avatar_url = publicURLData.publicUrl;
    }
  
    // Update the profiles table with the new avatar URL
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url, // Save the new avatar URL in the profiles table
      })
      .eq('user_id', user.id); // Ensure it updates the correct profile
  
    if (error) {
      console.error('Error updating profile:', error);
    } else {
      alert('Profile updated successfully!');
      setProfile({ ...profile, avatar_url });
    }
  
    setLoading(false);
  };
  
  

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/signin');
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  return (
    <div className="mt-24 pt-4 max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200">
      <Card>
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">Profile</h1>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Update Profile Picture</label>
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-24 h-24 rounded-full mb-2 object-cover"
              />
            )}
            <input
              type="file"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="mt-2"
            />
          </div>

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
          </CardContent>
      </Card>
    </div>
  );
}
