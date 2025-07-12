// routes/salesforce.ts
import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/upgrade", async (req, res) => {
    try {
        if (!req.session.salesforce) {
            return res.status(401).send("❌ Authorise via /salesforce/auth");
        }

        const { access_token, instance_url } = req.session.salesforce;

        const account = await axios.post(
            `${instance_url}/services/data/v57.0/sobjects/Account`,
            { Name: req.body.companyName },
            { headers: { Authorization: `Bearer ${access_token}` } }
        );

        const contact = await axios.post(
            `${instance_url}/services/data/v57.0/sobjects/Contact`,
            {
                LastName: req.body.lastName,
                Email: req.body.email,
                AccountId: account.data.id
            },
            { headers: { Authorization: `Bearer ${access_token}` } }
        );

        res.json({ accountId: account.data.id, contactId: contact.data.id });
    } catch (err: any) {
        console.error("❌ Salesforce error:", err.response?.data || err.message);
        res.status(500).send("Error during creation Account/Contact");
    }
});

export default router;
