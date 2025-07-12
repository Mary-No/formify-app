import express, { Router } from 'express';
import axios from 'axios';

const router: Router = express.Router();

router.get("/auth", (_, res) => {
    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SALESFORCE_CLIENT_ID!,
        redirect_uri: process.env.SALESFORCE_CALLBACK_URL!,
        scope: "api refresh_token"
    });
    res.redirect(`https://login.salesforce.com/services/oauth2/authorize?${params.toString()}`);
});

router.get("/callback", async (req, res) => {
    const code = req.query.code as string;
    try {
        const response = await axios.post(
            "https://login.salesforce.com/services/oauth2/token",
            new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_id: process.env.SALESFORCE_CLIENT_ID!,
                client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
                redirect_uri: process.env.SALESFORCE_CALLBACK_URL!
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" }}
        );
        req.session.salesforce = {
            access_token: response.data.access_token,
            instance_url: response.data.instance_url,
            refresh_token: response.data.refresh_token,
            expires_at: Date.now() + response.data.expires_in * 1000
        };
        return res.redirect(`${process.env.CLIENT_URL!}/account`);
    } catch (err: any) {
        console.error("❌ Salesforce token exchange error:", err.response?.data || err.message);
        res.status(500).send(`Salesforce OAuth error: ${JSON.stringify(err.response?.data || err.message)}`);
    }
});


export default router;
