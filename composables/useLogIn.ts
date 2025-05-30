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
