// pages/api/recaptcha.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  success: boolean;
  message: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  const { token } = req.body;

  if (!token) {
    res.status(400).json({ success: false, message: 'Token missing' });
    return;
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    // Send a request to Google's reCAPTCHA API to verify the token
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    if (!response.ok) {
      throw new Error("Failed to reach Google reCAPTCHA");
    }

    const data = await response.json();

    if (data.success) {
      res.status(200).json({ success: true, message: 'Human verified' });
    } else {
      res.status(400).json({ success: false, message: 'Failed reCAPTCHA verification' });
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);  // Log the error for debugging
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default handler;
