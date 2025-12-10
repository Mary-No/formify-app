import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt';


const prisma = new PrismaClient()

async function main() {
    const email = 'mascha.novik@gmail.com'

    const admin = await prisma.user.upsert({
        where: { email },
        update: { isAdmin: true },
        create: {
            email,
            nickname: 'Mary',
            password: await bcrypt.hash('qwe', 10),
            isAdmin: true,
        },
    })

    console.log('Admin ensured:', admin)
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
