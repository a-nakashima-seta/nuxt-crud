export const useLogIn = () => {
    const logIn = async (email: string, password: string) => {
        try {
            const { data, error } = await useFetch('/api/login', {
                method: 'POST',
                body: {
                    email,
                    password
                },
            })

            if (error.value) {
                // サーバーから返されたエラー情報を保持
                const statusMessage = error.value.data?.statusMessage || error.value.statusMessage || 'ログインに失敗しました。'
                const statusCode = error.value.statusCode || 401
                throw createError({
                    statusCode,
                    statusMessage
                })
            }

            return data.value

        } catch (err: any) {
            // エラーオブジェクトをそのまま再スロー
            if (err.statusCode && err.statusMessage) {
                throw err
            }
            // 予期せぬエラーの場合
            throw createError({
                statusCode: 500,
                statusMessage: '予期せぬエラーが発生しました。'
            })
        }
    }
    return {
        logIn
    }
}