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
                const statusCode = error.value?.statusCode || 500
                const message = error.value?.statusMessage || 'ログインに失敗しました。'
                throw createError({
                    statusCode: statusCode,
                    statusMessage: message
                })
            }

            return data.value

        } catch (err: any) {
            throw err
        }
    }
    return {
        logIn
    }
}