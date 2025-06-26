import { json } from "@sveltejs/kit";
import { GOOGLE_EMAIL } from "$env/static/private";
import transporter from "$lib/emailSetup.server.js";

export async function POST({ request }) {
    try {
        const { email, subject, body } = await request.json();

        if (!email || !subject || !body) {
            return json({ error: "Missing email, subject, or body" }, { status: 400 });
        }

        console.log("Sending email to:", email);
        
        const message = {
            from: GOOGLE_EMAIL,
            to: email,
            subject: subject,
            text: body,
            html: body,
        };

        await transporter.sendMail(message);

        return json({ success: "Email sent successfully" });
    } catch (error) {
        console.error("Email sending error:", error);
        return json({ error: "Failed to send email" }, { status: 500 });
    }
}
