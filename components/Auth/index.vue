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
