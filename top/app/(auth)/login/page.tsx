"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation to the next phase
import ReCAPTCHA from "react-google-recaptcha";
import { FaCircleUser } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { verifyCaptcha } from "../../pages/api/ServerActions";  // Recaptcha Server Path
import HoldButton from "../../components/HoldButton"; // Import HoldButton
import Cookies from "js-cookie";
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

  const kyc_progress = Cookies.get("kyc_progress");
  console.log(kyc_progress);
  
    // Check for user session on page load
  useEffect(() => {
    const savedUser = Cookies.get("circleUser");
    if (savedUser) {
      const cookieData = JSON.parse(savedUser);
      if (!cookieData.saveLogin) {
        Cookies.remove("circleUser"); // Clear cookies explicitly
      } else {
        router.push("/homePage");
      }
    }
  }, []);

  async function handleCaptchaSubmission(token: string | null) {
    // Server function to verify captcha
    await verifyCaptcha(token)
      .then(() => setIsverified(true))
      .catch(() => setIsverified(false));
  }

  // Email Regex for stricter validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle form submission with validation and sanitization
  const handleLogIn = async () => {
    // event.preventDefault();
    setError("");
    setSuccess(false);
    setUploading(true);

    // Simple input sanitization by trimming white spaces
    const sanitizedEmail = email.trim();

    // Validate inputs
    if (!sanitizedEmail || !password || !isVerified ) {
      setError("Please fill in all the fields and complete the reCAPTCHA.");
      setUploading(false);
      return;
    }

    if (!emailRegex.test(sanitizedEmail)) {
      setError("Invalid email format.");
      setUploading(false);
      return;
    }

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
        isBetaUser: user.isBetaUser,
        isMerchant: user.isMerchant,
        saveLogin, // Add saveLogin flag to the cookie
      }), {
        path: "/",
        sameSite: "Strict",
        secure: true,
        ...(saveLogin ? { expires: 7 } : {}), // Use expires only if saveLogin is checked
      });

      const updateLastLogin = async (uuid: string, country: string) => {
        try {
          const response = await fetch('/pages/api/lastLogin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid, country }),
          });
      
          if (!response.ok) {
            // Attempt to parse as JSON; fallback to plain text for debugging
            const errorText = await response.text(); // Use .text() to debug non-JSON responses
            console.error('Failed to update last login:', errorText);
            // console.error('Failed to update last login:', errorText); //Newly Added Debug
            throw new Error('Failed to update last login');
          }

          const result = await response.json();
          console.log('Last login updated successfully:', result);

        } catch (error) {
          console.error('Error updating last login:', error);
        }
      };
      

            // Update the last_login field in the database
      await updateLastLogin(user.uuid, user.country);

      setEmail("");
      setPassword("");
      setSuccess(true);
      setUploading(false);

    router.push("/homePage");
    }  catch (err) {
      if (err instanceof Error) {
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


  return (
    <IsMobile>
      <div className="loginContainer">
        <span className="circleUser"><FaCircleUser /></span>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>ACCESS GRANTED : YOU ARE OMMICANG</p>}
        <form onSubmit={handleLogIn}>

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
              onComplete={handleLogIn} 
              disabled={uploading}
              label={uploading ? "Logging In..." : "I'M OMMICANG"}
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