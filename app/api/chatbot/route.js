import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const { userMessage } = await req.json();

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      { inputs: userMessage },
      {
        headers: {
          Authorization: `Bearer YOUR_HUGGINGFACE_API_KEY`,
        },
      }
    );

    const botResponse = response.data?.generated_text || 'I am not sure. Let me connect you with an agent.';

    return NextResponse.json({ botResponse });
  } catch (error) {
    console.error('Error in chatbot API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
