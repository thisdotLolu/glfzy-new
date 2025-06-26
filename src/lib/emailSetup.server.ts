import nodemailer from "nodemailer";
import { GOOGLE_EMAIL, GOOGLE_EMAIL_PASSWORD } from "$env/static/private";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: GOOGLE_EMAIL,
    pass: GOOGLE_EMAIL_PASSWORD,
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
transporter.verify(function (error:any, success:any) {
  if (error) {
    console.error(error);
  } else {
    console.log("Server is ready to take our messages");
    console.log(success)
  }
});

export default transporter;