import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('qwe111', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'mascha.novik@gmail.com' },
        update: {},
        create: {
            email: 'mascha.novik@gmail.com',
            nickname: 'MaryNo',
            password,
            isAdmin: true,
        },
    })

    console.log('Admin created:', admin)
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
