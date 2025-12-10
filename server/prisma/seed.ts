import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
    const email = 'mascha.novik@gmail.com'

    const updatedUser = await prisma.user.update({
        where: { email },
        data: { isAdmin: true },
    })

    console.log('User updated:', updatedUser)
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())