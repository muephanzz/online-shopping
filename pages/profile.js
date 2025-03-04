import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const Profiles = () => {
  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
  
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
  
    if (userError || !user) {
      console.error("Error fetching user or user not logged in:", userError);
      setLoading(false);
      return;
    }
  
    // Fetch profile with the user's email
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        first_name,
        last_name,
        email
      `)
      .eq("user_id", user.id);
  
    if (error) console.error("Error fetching profile:", error);
    else setProfile(data);
  
    setLoading(false);
  };
  

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {loading && <p>Loading your profile...</p>}

      {!loading && profile.length === 0 && <p>No profile found.</p>}

      {!loading && (
        <ul className="space-y-6">
          {profile.map((item) => (
            <li key={item.user_id} className="border p-4 rounded-lg">
              <p><strong>First Name:</strong> {item.first_name}</p>
              <p><strong>Last Name:</strong> {item.last_name}</p>
              <p><strong>Email:</strong> {item.email}</p>
            </li>
          ))}

        </ul>
      )}
    </div>
  );
};

export default Profiles;       