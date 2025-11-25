import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireNotBlocked } from "../middleware/requireNotBlocked";
import { prisma } from "../prisma";
import {getUserId} from "../utils/getUserId";

const router = express.Router()
router.use(requireAuth, requireNotBlocked)

router.post("/", async (req, res) => {
    const userId = getUserId(req)
    const { type } = req.body;
    if (!["BUSINESS", "PREMIUM"].includes(type)) {
       res.status(400).json({ message: "Invalid account type" });
        return
    }

    const existing = await prisma.companyAccount.findUnique({
        where: { ownerId: userId }
    });
    if (existing) {
        res.status(400).json({ message: "You already own a company" });
        return
    }

    const company = await prisma.companyAccount.create({
        data: {
            type,
            owner: { connect: { id: userId }},
            users: { connect: { id: userId } }
        }
    });

    res.json(company);
});

router.patch("/:id/type", async (req, res) => {
    const { type } = req.body;
    if (!["BUSINESS", "PREMIUM"].includes(type)) {
        res.status(400).json({ message: "Invalid account type" });
        return
    }

    const company = await prisma.companyAccount.findUnique({
        where: { id: req.params.id }
    });

    if (!company || company.ownerId !== req.session.userId) {
        res.status(403).json({ message: "Not allowed" });
        return
    }

    const updated = await prisma.companyAccount.update({
        where: { id: company.id },
        data: { type }
    });

    res.json(updated);
});
router.post("/:id/users", async (req, res) => {
    const { userId } = req.body;

    const company = await prisma.companyAccount.findUnique({
        where: { id: req.params.id },
        include: { users: true }
    });

    if (!company || company.ownerId !== req.session.userId) {
        res.status(403).json({ message: "Not allowed" });
        return
    }

    if (company.type === "BUSINESS" && company.users.length >= 15) {
        res.status(400).json({ message: "Max users reached for BUSINESS plan" });
        return
    }

    await prisma.user.update({
        where: { id: userId },
        data: { company: { connect: { id: company.id } } }
    });

    res.json({ message: "User added" });
});

router.delete("/:id/users/:userId", async (req, res) => {
    const company = await prisma.companyAccount.findUnique({
        where: { id: req.params.id }
    });

    if (!company || company.ownerId !== req.session.userId) {
       res.status(403).json({ message: "Not allowed" });
        return
    }

    await prisma.user.update({
        where: { id: req.params.userId },
        data: { company: { disconnect: true } }
    });

    res.json({ message: "User removed from company" });
});

router.get("/api/company/:id", async (req, res) => {
    const company = await prisma.companyAccount.findUnique({
        where: { id: req.params.id },
        include: { users: true }
    });

    if (!company || company.ownerId !== req.session.userId) {
        res.status(403).json({ message: "Not allowed" });
        return
    }

    res.json(company);
});

export default router