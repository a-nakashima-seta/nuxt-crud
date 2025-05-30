【目的・概要】
Nuxt3で開発中のCRUDアプリに認証機能を追加したいです。

【現在の状況】
- Nuxt 3 + TypeScript で認証機能を実装中
- 認証関連のコンポーネントは下記
components\Auth\index.vue
components\Auth\LoginForm.vue
components\Auth\SignUpForm.vue

- 下記でデータフェッチ用の関数を再利用可能な関数として切り出している
composables\useSignUp.ts
composables\useLogIn.ts

- 下記でユーザーの認証状態を管理したい
composables\useAuth.ts

- 登録処理は既に実装完了している。

【希望する結果】
- ログイン処理に関して、登録済みのユーザー情報でログインが成功した場合にuseAuth.tsで保持している状態を切り替えたい。
まずはテストとして（赤い丸：ログアウト中）（緑の丸：ログイン中）というように見た目で認証状態がわかるようにしたい。
- ↑実装完了できました。セッション状態の保持のフェーズに移行します。再読み込み時や一度タブを閉じ再度アクセスした場合にもセッションの状態に応じて（赤い丸：ログアウト中）（緑の丸：ログイン中）を切り替えたいです。

【現状の関連コード】
layouts\auth\index.vue
<script setup lang="ts">
const { isAuthenticated } = useAuth()

</script>

<template>
    <div>
        <div class="flex items-center space-x-2">
            <span :class="[
                'w-3 h-3 rounded-full',
                isAuthenticated ? 'bg-green-500' : 'bg-red-800'
            ]"></span>
            <span>{{ isAuthenticated ? 'ログイン中' : 'ログアウト中' }}</span>
        </div>
        <h1 class="font-bold text-3xl text-center m-4">Auth</h1>
        <slot />
    </div>
</template>

<style scoped></style>

components\Auth\index.vue
<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const items = [
    {
        label: 'ログイン',
        // description: 'Make changes to your account here. Click save when you\'re done.',
        icon: 'i-lucide-lock',
        slot: 'Login' as const
    },
    {
        label: 'アカウント作成',
        // description: 'Change your password here. After saving, you\'ll be logged out.',
        icon: 'i-lucide-user',
        slot: 'SignUp' as const
    }
] satisfies TabsItem[]
</script>

<template>
    <UTabs :items="items" variant="pill" class="gap-4 max-w-md m-auto" :ui="{ trigger: 'grow' }">
        <template #Login>
            <AuthLoginForm class="flex flex-col items-center" />
        </template>

        <template #SignUp>
            <AuthSignUpForm class="flex flex-col items-center" />
        </template>
    </UTabs>
</template>


components\Auth\LoginForm.vue
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// Zod初期化の記述
const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Must be at least 6 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    email: undefined,
    password: undefined
})

// フォーム送信後のミニポップアップ
const toast = useToast()

// 登録処理のハンドラー

const { logIn } = useLogIn()

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    try {
        console.table(event.data)

        await logIn(event.data.email, event.data.password)

        toast.add({ title: 'Success', description: 'ログインしました。', color: 'success' })
    } catch (err: any) {
        toast.add({ title: 'ログイン失敗', description: err.statusMessage || 'エラーが発生しました', color: 'error' })
    }
}
</script>

<template>
    <UForm :schema="schema" :state="state" class="space-y-4" @submit.prevent="onSubmit">
        <UFormField label="メールアドレス" name="email">
            <UInput v-model="state.email" />
        </UFormField>

        <UFormField label="パスワード" name="password">
            <UInput v-model="state.password" type="password" />
        </UFormField>

        <UButton type="submit">
            ログイン
        </UButton>
    </UForm>
</template>


composables\useLogIn.ts
// composables/useLogIn.ts
export const useLogIn = () => {
    const { setAuth } = useAuth()

    const logIn = async (email: string, password: string) => {
        try {
            const { data, error } = await useFetch('/api/login', {
                method: 'POST',
                body: { email, password },
            })

            if (error.value) {
                const statusMessage = error.value.data?.statusMessage || error.value.statusMessage || 'ログインに失敗しました。'
                const statusCode = error.value.statusCode || 401
                throw createError({ statusCode, statusMessage })
            }

            // 認証状態を更新
            if (data.value?.user) {
                setAuth(data.value.user)
            }

            return data.value
        } catch (err: any) {
            throw err.statusCode ? err : createError({ statusCode: 500, statusMessage: '予期せぬエラーが発生しました。' })
        }
    }

    return { logIn }
}


composables\useAuth.ts
export const useAuth = () => {
    const isAuthenticated = useState<boolean>('auth:isAuthenticated', () => false)
    const user = useState<{ id: number; email: string; username: string } | null>('auth:user', () => null)

    const setAuth = (userData: { id: number; email: string; username: string }) => {
        isAuthenticated.value = true
        user.value = userData
    }

    const clearAuth = () => {
        isAuthenticated.value = false
        user.value = null
    }

    return {
        isAuthenticated,
        user,
        setAuth,
        clearAuth,
    }
}


server\api\login.post.ts
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


【制約条件など】
- TypeScriptを使用
- UI は NuxtUI + Tailwind CSS
- フォームバリデーションはZod
- 状態管理はcomposablesディレクトリとuseState
- DBはsqlite
- ORMはPrisma
- bycryptとjsonwebtokenを使用

【出力フォーマット】
- `<script setup lang="ts">` を使った Vue コンポーネント
- server/api/配下のtypescriptファイル



【補足】
各種公式ドキュメント
【Nuxt3】
https://nuxt.com/docs/guide
【NuxtUI】
https://ui.nuxt.com/getting-started
