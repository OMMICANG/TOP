"use server"

// Concept By Daniel Craciun Medium on using Axios to verify Recaptchav2 for faster site load time

import axios from "axios"

export async function verifyCaptcha(token: string | null) {
  const res = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
  )
  if (res.data.success) {
    return "success!"
  } else {
    throw new Error("Failed Captcha")
  }
}


// ************************************************************************************************************************
// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ success: false, message: "Method Not Allowed" });
//   }

//   const { recaptchaToken } = req.body;

//   if (!recaptchaToken) {
//     return res.status(400).json({ success: false, message: "No reCAPTCHA token provided" });
//   }

//   const secretKey = process.env.RECAPTCHA_SECRET_KEY;
//   const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

//   try {
//     const response = await fetch(verificationUrl, {
//       method: "POST",
//     });
//     const data = await response.json();

//     if (data.success) {
//       res.status(200).json({ success: true, message: "reCAPTCHA verified successfully." });
//     } else {
//       res.status(400).json({ success: false, message: "reCAPTCHA verification failed." });
//     }
//   } catch (error) {
//     console.error("Error verifying reCAPTCHA:", error);
//     res.status(500).json({ success: false, message: "Server error during reCAPTCHA verification." });
//   }
// }




// *******************************************************************************************

// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ success: false, message: "Method Not Allowed" });
//   }

//   const { recaptchaToken } = req.body;

//   if (!recaptchaToken) {
//     return res.status(400).json({ success: false, message: "No reCAPTCHA token provided" });
//   }

//   const secretKey = process.env.RECAPTCHA_SECRET_KEY;
//   const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

//   try {
//     const response = await fetch(verificationUrl, {
//       method: "POST",
//     });
//     const data = await response.json();

//     if (data.success) {
//       res.status(200).json({ success: true, message: "reCAPTCHA verified successfully." });
//     } else {
//       res.status(400).json({ success: false, message: "reCAPTCHA verification failed." });
//     }
//   } catch (error) {
//     console.error("Error verifying reCAPTCHA:", error);
//     res.status(500).json({ success: false, message: "Server error during reCAPTCHA verification." });
//   }
// }

// **************************************************************************************************************************

// // pages/api/recaptcha.ts
// import type { NextApiRequest, NextApiResponse } from 'next';




// type Data = {
//   success: boolean;
//   message: string;
// };

// const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
//   if (req.method !== 'POST') {
//     res.status(405).json({ success: false, message: 'Method Not Allowed' });
//     return;
//   }

//   const { token } = req.body;

//   if (!token) {
//     res.status(400).json({ success: false, message: 'Token missing' });
//     return;
//   }

//   const secretKey = process.env.RECAPTCHA_SECRET_KEY;

//   try {
//     // Send a request to Google's reCAPTCHA API to verify the token
//     const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: `secret=${secretKey}&response=${token}`,
//     });

//     if (!response.ok) {
//       throw new Error("Failed to reach Google reCAPTCHA");
//     }

//     const data = await response.json();

//     if (data.success) {
//       res.status(200).json({ success: true, message: 'Human verified' });
//     } else {
//       res.status(400).json({ success: false, message: 'Failed reCAPTCHA verification' });
//     }
//   } catch (error) {
//     console.error("Error verifying reCAPTCHA:", error);  // Log the error for debugging
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// export default handler;
