import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER_GMAIL,
      pass: process.env.USER_PASS,
    },
  });

  const mailOptions = {
    from: `"Infinity Learn 👻" <${process.env.USER_GMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: `
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f7fc;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center;">
                    <img src="cid:logo" alt="Infinity Learn Logo" style="width: 200px; height: auto;"/>
                </div>
                <h2 style="font-size: 25px; font-weight: bold; ">Hello from Infinity Learn 👋</h2>
                <p style="font-size: 16px; line-height: 1.6; "><b>${options.message}</b></p>
                <p style="font-size: 16px; color: #555;">Best regards,</p>
                <p style="font-size: 16px;  font-weight: bold;">The Infinity Learn Team</p>
                <footer style=" margin-top: 30px;">
                    <p style="font-size: 14px;">You received this email because you signed up for Infinity Learn.</p>
                    <p style="font-size: 14px;">If you didn't expect this email, please ignore it.</p>
                </footer>
            </div>
        </body>
    </html>
`,
    // attachments: [
    //   {
    //     filename: "Logo_infinity.png",
    //     path: "D:\CADT(Y3)\term-2\Capstone 1\Development\Infinity-Learn\assets\Logo_infinity.png",
    //     cid: "logo",
    //   },
    // ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};
export default sendEmail;
