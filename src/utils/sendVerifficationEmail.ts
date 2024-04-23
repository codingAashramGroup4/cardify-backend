import nodemailer from "nodemailer";
import { ApiError } from "./ApiError";
import { ApiResponse } from "./ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_MAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const mailOptions = {
      from: process.env.NODEMAILER_MAIL,
      to: email,
      subject: "Your Verification Otp For Cardify",
      html: `<html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>
        <div
          style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"
        >
          <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
              <a
                href=""
                style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"
              >Cardify</a>
              <div style="text-align: center; padding: 20px 0">
                <a href="https://www.google.com/" title="logo" target="_blank">
                  <img
                    width="80"
                    height="60"
                    src="https://i.pngimg.me/thumb/f/720/m2i8G6G6Z5A0i8b1.jpg"
                    title="logo"
                    alt="logo"
                  />
                </a>
              </div>
            </div>
            <p style="font-size:1.1em">Hi,</p>
            <p>Thank you ${username}, For  choosing Cardify. Use the following OTP to complete your
              Verification procedures. OTP is valid for 2 minutes</p>
            <h2
              style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;text-align: center"
            >${verifyCode}</h2>
            <p style="font-size:0.9em;">Regards,<br />Qrofid</p>
            <hr style="border:none;border-top:1px solid #eee" />
            {{! <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>Cardify</p>
          <p>Made By Team Data Dragon</p>
          <p>With Love </p>
        </div> }}
          </div>
        </div>
    
      </body>
    </html>`,
    };

    const result = await transporter.sendMail(mailOptions);

    if (result.accepted.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Erorr While Sending Verification Email", error);
    throw new ApiError(
      504,
      "Error While Sending Verification Email Check Server Console"
    );
  }
}
