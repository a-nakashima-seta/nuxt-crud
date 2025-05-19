import { prisma } from '~/server/prisma/client'
import { hash } from 'bcrypt'

export default defineEventHandler(async (event) => {
  // リクエストボディを取得する
  const body = await readBody<{ name: string; email: string; password: string }>(event)

  // ユーザーが既に存在するかを確認する
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  })

  // ユーザーが既に存在していたらエラーを返す
  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: 'User already exists' })
  }

  // パスワードをハッシュ化する
  const hashedPassword = await hash(body.password, 10)

  // ユーザーを作成する
  const user = await prisma.user.create({
    data: {
      username: body.name,
      email: body.email,
      password: hashedPassword,
    },
  })

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  }
})
