import { prisma } from '~/server/prisma/client'
import { compare } from 'bcrypt'
import jwt from "jsonwebtoken";

const TOKEN = process.env.JWT_SECRET || 'default_secret'
const { sign } = jwt;

export default defineEventHandler(async (event) => {

    const body = await readBody<{ email: string; password: string }>(event)

    // 登録済みユーザーの検索
    const user = await prisma.user.findUnique({
        where: { email: body.email },
    })
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'アカウントが存在しません。' })
    }

    // パスワード照合
    const isPasswordValid = await compare(body.password, user.password)
    if (!isPasswordValid) {
        throw createError({ statusCode: 401, statusMessage: 'パスワードに誤りがあります。' })
    }

    // JWTを生成（ここでは簡単な例）
    const token = sign(
        { id: user.id, email: user.email },
        TOKEN,
        { expiresIn: '7d' }
    )

    // トークンをクッキーに保存
    setCookie(event, 'token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        path: '/',
    })


    return {
        message: '認証完了しました。',
        user: { id: user.id, username: user.username, email: user.email },
    }

})