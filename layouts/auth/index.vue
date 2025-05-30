<script setup lang="ts">
const { isAuthenticated, fetchSession } = useAuth()

onMounted(() => {
  fetchSession()
})

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