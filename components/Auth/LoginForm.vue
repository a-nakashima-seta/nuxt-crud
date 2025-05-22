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
