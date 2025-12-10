import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('qwe', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'mascha.novik@gmail.com' },
        update: {},
        create: {
            email: 'mascha.novik@gmail.com',
            nickname: 'Mary',
            password,
            isAdmin: true,
        },
    })

    console.log('Admin created:', admin)
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
