import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log(`Function "email" up and running!`);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');



serve(async (req: Request) => {
    try {
      const { email, name } = await req.json(); // Adjust as per your KYC data
      
      if (!email || !name) {
        return new Response(JSON.stringify({ error: "Missing data" }), { status: 400 });
      }
  
      const headers = {
        Authorization: `Bearer ${RESEND_API_KEY} `,
        "Content-Type": "application/json",
      };

      const emailData = {
        from: "no-reply@theommicangcircle.site",  // Use a verified email
        to: email,
        subject: "THE OMMICANG CIRCLE - KYC DECLINE EMAIL",
        html: ` 
  <div style=" margin: 0; padding: 0; display: flex; justify-self: center; justify-content: center;
      align-items: center; width: 85vw; height: auto; color: white; background-color: #a7a7a7; border: 10px ridge goldenrod;">

       <div style=" width: 90%; margin: 5px; padding-left: 20px; align-content: flex-start;
           word-wrap: break-word; background-color: #000; color: #fff;">

           <div style="display: flex; flex-direction: row; font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; width: 95%; margin-top: 20px; margin-bottom: 20px; align-items: left; 
             font-weight: 700;">

             <img src="https://top-orcin.vercel.app/images/OMMICANG_New_Logo.jpg" alt="Logo" style="width: 75px; height: 75px;
             margin-left: -20px; " />
             <h1 style="font-size: 22px; color: goldenrod; text-transform: uppercase;">the ommicang circle</h1>

           </div>

           <div style=" display: block; width: 95%; font-family: Georgia, serif; margin-bottom: 20px; font-weight: 500; color: #fff;">
             <p>Dear ${name} 😞,</p>
             <p> We Are Sorry To Inform You, But Your Request To <strong style="color: goldenrod;">BE OMMICANG</strong> Has Been Declined.</p>
             <p> One Or More Of The Below Could Be A Possible Reason For The Decline: </p> <br/>
             <p> ❌ Incorrect Identity Details | Name Or ID Number doesn't Match Provided ID Card Image  </p>
             <p> ❌ Incorrect Identity Card Image  </p>
             <p> ❌ Blurry Face Image  </p>
             <p> ❌ Incorrect Words Spoken On Video Recording  </p>
             <p> This Is Not The End. Kindly Redo The KYC Verification Steps whilst Providing the accurate required Data 
              and You'll Be OMMICANG.  </p>
              <p> Hope To Hear From You Soon 💞</p>
              <p> Below Is Your Attempted Sign-up Email, Do Consider Signing Up With the Same Email</p>
             <p> - OMMICANG ✍ </p> <hr>



             <p><strong style="color: goldenrod;">Email:</strong> ${email}</p><hr>

           </div>

           <div style=" width: 95%; font-family: serif;">

             <footer style="margin-top: 30px; margin-bottom: 10px; color: #a7a7a7;">
               <p style="text-align: center; color: goldenrod;">&copy; 2024 THE OMMICANG CIRCLE  </p>
               <p>Please do not reply to this email as it is not being monitored by any of our support team.</p>
               <p>If you need support, kindly reach out to <a href="#">support@TheOmmicangCircle.online</a> </p>
             </footer>
           
           </div>
       </div>
     </div>`,
      };
  
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers,
        body: JSON.stringify(emailData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to send email");
      }
  
      return new Response(JSON.stringify({ message: "Success" }), { status: 200 });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }
  });
