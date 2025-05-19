export const useSignUp = () => {
    const signUp = async (name: string, email: string, password: string) => {
        try {
            const { data, error } = await useFetch('/api/signup', {
                method: 'POST',
                body: { name, email, password },
            })

            if (error.value) throw error.value

            return data.value
        } catch (err: any) {
            throw createError({ statusCode: 500, statusMessage: err?.message || '505 - ユーザー登録に失敗しました。' })
        }
    }

    return {
        signUp,
    }
}
