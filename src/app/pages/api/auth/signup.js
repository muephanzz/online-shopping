// pages/api/auth/signup.js
import { prisma } from '../../../lib/prisma'; 
import { supabase } from '../../../lib/supabaseClient'; 

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { emailOrPhone, password, fname, lname } = req.body;
    const isEmail = emailOrPhone.includes('@');

    try {
      // Step 1: Check if the user already exists using Prisma
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: isEmail ? emailOrPhone : undefined },
            { phone: !isEmail ? emailOrPhone : undefined }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Account already exists.' });
      }

      // Step 2: Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        [isEmail ? 'email' : 'phone']: emailOrPhone,
        password,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Step 3: Insert user data into the 'User' table using Prisma
      const newUser = await prisma.user.create({
        data: {
          email: isEmail ? emailOrPhone : null,  // Set to null if not provided
          phone: !isEmail ? emailOrPhone : null, // Set to null if not provided
          fname,
          lname,
          // Store hashed password if you're managing passwords yourself (Supabase usually handles this)
        },
      });

      return res.status(200).json({ message: 'Account created successfully! You can now sign in.' });
    } catch (err) {
      console.error('SignUp Error:', err);
      return res.status(500).json({ error: 'An error occurred. Please try again.' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
