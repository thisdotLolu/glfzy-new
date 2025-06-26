import { GOOGLE_EMAIL } from '$env/static/private';
import transporter from '$lib/emailSetup.server.js';

export const actions = {
    default: async({ request }) => {
        try {
            const formData = await request.formData();
            const email = formData.get("to");
            const subject = formData.get("subject");
            const body = formData.get("body");
            
            console.log("Sending email to:", email);
            console.log("Email subject:", subject);
            console.log("Email body:", body);
            
            if (!email) {
                console.error("Missing email address");
                return {
                    error: "Missing email address"
                };
            }

            const html = `${body}`;

            const message = {
                from: GOOGLE_EMAIL,
                to: email,
                bcc: "",
                subject: subject,
                text: body,
                html: html,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sendEmail = async (message:any) => {
                await new Promise((resolve, reject) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    transporter.sendMail(message, (err, info) => {
                        if (err) {
                            console.error("Email sending failed:", err);
                            reject(err);
                        } else {
                            console.log("Email sent successfully:", info.response);
                            resolve(info);
                        }
                    });
                });
            };
            
            await sendEmail(message);
            
            return {
                success: "Email is sent"
            };
        } catch (error) {
            console.error("Email action error:", error);
            return {
                error: "Failed to send email"
            };
        }
    }
}