"use client";

import { useRef, useState } from "react";
// import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation"; // For navigation to the next phase
import ReCAPTCHA from "react-google-recaptcha";
import { FaCircleUser } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { verifyCaptcha } from "../../pages/api/ServerActions";  // Recaptcha Server Path
import HoldButton from "../../components/HoldButton"; // Import HoldButton
import Cookies from "js-cookie";
// import bcrypt from "bcryptjs"; // Import bcrypt for password comparison
import IsMobile from "../../components/IsMobile";
import "../../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // State for password input
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false); // To track upload status
  const [saveLogin, setSaveLogin] = useState(false); // Track checkbox state
  const router = useRouter(); // Use Next.js router for navigation
  const recaptchaRef = useRef(null);
  const [isVerified, setIsverified] = useState<boolean>(false);

  async function handleCaptchaSubmission(token: string | null) {
    // Server function to verify captcha
    await verifyCaptcha(token)
      .then(() => setIsverified(true))
      .catch(() => setIsverified(false));
  }

  // const countryTables = ["approved_users_Nigeria", "approved_users_UnitedKingdom"];

  // Email Regex for stricter validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle form submission with validation and sanitization
  const handleSubmit = async () => {
    // event.preventDefault();
    setError("");
    setSuccess(false);
    setUploading(true);

    // Simple input sanitization by trimming white spaces
    const sanitizedEmail = email.trim();

    // Validate inputs
    if (!sanitizedEmail || !password || !isVerified) { 
      setError("Please fill in all the fields and complete the reCAPTCHA.");
      setUploading(false);
      return;
    }

    if (!emailRegex.test(sanitizedEmail)) {
      setError("Invalid email format.");
      setUploading(false);
      return;
    }

    // let userFound = null;

    // for (const table of countryTables) {
    //   const { data, error } = await supabase
    //     .from(table)
    //     .select(`uuid,name,country,email,password`)
    //     .eq("email", sanitizedEmail)
    //     .single();
    //     console.log(JSON.stringify(data))
    //     if (error && error.code !== "PGRST116") {
    //       console.error(`Error fetching from ${table}:`, error);
    //       continue;
    //     }

    //   if (data) {
    //     userFound = data;
    //     break;
    //   }
    //   console.log(error);
    // }

    // if (userFound) {
    //  // Verify the entered password against the hashed password
    //  const passwordMatch = await bcrypt.compare(password, userFound.password);

    //  if (passwordMatch) {
    //   setEmail("");
    //   setPassword("");
    //   setSuccess(true);
    //   setUploading(false);

    // // Store user details in cookies
    // Cookies.set("circleUser", JSON.stringify({
    //   uuid: userFound.uuid,
    //   name: userFound.name, // Extract first name
    //   country: userFound.country,
    //   email: userFound.email,
    // }),{
    //   path: "/",
    //   sameSite: "Strict",
    //   secure: true, // Use true for HTTPS in production
    // });

    // Navigate to HomePage

    try {
      const response = await fetch("/pages/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const user = await response.json();

      // Store user details in cookies
      Cookies.set("circleUser", JSON.stringify({
        uuid: user.uuid,
        name: user.name,
        country: user.country,
        email: user.email,
      }), {
        path: "/",
        sameSite: "Strict",
        secure: true,
        expires: saveLogin ? 7 : undefined, // Save for 7 days if checkbox is checked
      });

      setEmail("");
      setPassword("");
      setSuccess(true);
      setUploading(false);

    router.push("/homePage");
    }  catch (err) {
      if (error instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setUploading(false);
      setEmail("");
      setPassword("");
    }
  };
    
//     else {
//       setError("Incorrect password. Please try again.");
//       setUploading(false);
//     } 
//   }else {
//     setError("You Are Not OMMICANG");
//     setUploading(false);
//     setEmail("");
//     setPassword("");
//   }
// };


  return (
    <IsMobile>
      <div className="loginContainer">
        <span className="circleUser"><FaCircleUser /></span>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>ACCESS GRANTED : YOU ARE OMMICANG</p>}
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
                // disabled
              />
            <span className="mdEmail"><MdEmail /></span>
            </div>

            <div className="password">
              <label>Pass:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter Password"
              />
            <span className="mdPassword"><RiLockPasswordFill /></span>
            </div>

          </fieldset>

          <div className="checkbox">
          <input
            type="checkbox"
            checked={saveLogin}
            onChange={(e) => setSaveLogin(e.target.checked)}
          />

              <span>save login</span>
              </div>

          <span className="buttonContainer">
            <HoldButton 
              onComplete={handleSubmit} 
              disabled={uploading}
              label={uploading ? "Uploading..." : "I'M OMMICANG"}
            />
          </span>

          {/* reCAPTCHA component */}
          <span className="recaptcha">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              ref={recaptchaRef}
              onChange={handleCaptchaSubmission}
            />
          </span>

          <span className="register">don&apos;t have  an account? <a href="../kyc/kycPhase1"> Be Ommicang</a> </span>
        </form>
      </div>
    </IsMobile>
  );
};

export default Login;