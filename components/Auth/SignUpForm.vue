<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// Zod初期化の記述
const schema = z.object({
    username: z.string(),
    email: z.string().email('Invalid email'),
    password: z.string().min(4, 'Must be at least 4 characters')
})

type Schema = z.output<typeof schema>

const state = ref<Partial<Schema>>({
    username: undefined,
    email: undefined,
    password: undefined
})

// フォーム送信後のミニポップアップ
const toast = useToast()


const { signUp } = useSignUp()

// 登録処理のハンドラー
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    try {
        console.table(event.data)

        await signUp(event.data.username, event.data.email, event.data.password)
        toast.add({ title: '登録完了', description: 'ユーザー登録が完了しました', color: 'success' })

    } catch (err: any) {
        toast.add({ title: '登録失敗', description: err.statusMessage || 'エラーが発生しました', color: 'error' })
    }
}
</script>

<template>
    <UForm :schema="schema" :state="state" class="space-y-4" @submit.prevent="onSubmit">
        <UFormField label="ユーザー名" name="username">
            <UInput v-model="state.username" />
        </UFormField>

        <UFormField label="メールアドレス" name="email">
            <UInput v-model="state.email" />
        </UFormField>

        <UFormField label="パスワード" name="password">
            <UInput v-model="state.password" type="password" />
        </UFormField>

        <UButton type="submit">
            作成
        </UButton>
    </UForm>
</template>
