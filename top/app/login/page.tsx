"use client";

import { useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient.ts";
import { useRouter } from "next/navigation"; // For navigation to the next phase
import ReCAPTCHA from "react-google-recaptcha";
import { FaCircleUser } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { verifyCaptcha } from "../pages/api/ServerActions.ts";  // Recaptcha Server Path
import IsMobile from "../components/IsMobile";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false); // To track upload status
  const router = useRouter(); // Use Next.js router for navigation
  const recaptchaRef = useRef(null);
  const [isVerified, setIsverified] = useState<boolean>(false);

  async function handleCaptchaSubmission(token: string | null) {
    // Server function to verify captcha
    await verifyCaptcha(token)
      .then(() => setIsverified(true))
      .catch(() => setIsverified(false));
  }

  // Email Regex for stricter validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle form submission with validation and sanitization
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setUploading(true);

    // Simple input sanitization by trimming white spaces
    const sanitizedEmail = email.trim();

    // Validate inputs
    if (!sanitizedEmail || !isVerified) { 
      setError("Please fill in all the fields and complete the reCAPTCHA.");
      setUploading(false);
      return;
    }

    if (!emailRegex.test(sanitizedEmail)) {
      setError("Invalid email format.");
      setUploading(false);
      return;
    }

    // Generate a unique UUID for the KYC process
    const kycUUID = crypto.randomUUID();

    // Insert data into Supabase with the generated UUID
    const { error: dbError } = await supabase.from("kyc_users").insert([
      {
        uuid: kycUUID,  // Storing the UUID
        email: sanitizedEmail,
      },
    ]);

    if (dbError) {
      setError("Failed to submit. Try again.");
      setUploading(false);
      return;
    }


    // Store the UUID in localStorage for subsequent phases
    localStorage.setItem("kycUUID", kycUUID);

    setEmail("");

    // Navigate to Phase 2 (Face Capture)
    router.push("/kyc/faceCapture");
  };


  return (
    <IsMobile>
      <div className="loginContainer">
        <span className="circleUser"><FaCircleUser /></span>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>Identity details submitted successfully! Proceeding to Face Capture...</p>}
        <form onSubmit={handleSubmit}>

          <fieldset>
            <legend>LOGIN</legend>

            <div className="email">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter Email"
                disabled
              />
            <span className="mdEmail"><MdEmail /></span>
            </div>

          </fieldset>

          <div className="checkbox">
          <input
                type="checkbox"
                value={email}
              />

              <span>save login</span>
              </div>

          <span className="buttonContainer">
            <button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "I'M OMMICANG"}
            </button>
          </span>

          {/* reCAPTCHA component */}
          <span className="recaptcha">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              ref={recaptchaRef}
              onChange={handleCaptchaSubmission}
            />
          </span>

          <span className="register">don&apos;t have  an account? <a href="../kyc/kycPhase1">Be Ommicang</a> </span>
        </form>
      </div>
    </IsMobile>
  );
};

export default Login;