import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function auth(email: string, password: string, username: string) {
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password,
    },
  })

  console.log(user)
}

async function main() {
  await auth("test@gmail.com", "test_username", "123456")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
