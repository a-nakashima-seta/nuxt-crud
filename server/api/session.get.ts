import jwt from 'jsonwebtoken'
import { prisma } from '~/server/prisma/client'

const { verify } = jwt

const TOKEN = process.env.JWT_SECRET || 'default_secret'

export default defineEventHandler(async (event) => {
    try {
        const token = getCookie(event, 'token')

        if (!token) {
            throw createError({ statusCode: 401, statusMessage: '未認証です。' })
        }

        const decoded = verify(token, TOKEN) as { id: number }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, username: true },
        })

        if (!user) {
            throw createError({ statusCode: 404, statusMessage: 'ユーザーが存在しません。' })
        }

        return { user }
    } catch {
        throw createError({ statusCode: 401, statusMessage: '認証に失敗しました。' })
    }
})
