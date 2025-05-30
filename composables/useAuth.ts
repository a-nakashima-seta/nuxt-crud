import type { User } from '@/types/types'


export const useAuth = () => {
    const isAuthenticated = useState<boolean>('auth:isAuthenticated', () => false)
    const user = useState<User | null>('auth:user', () => null)

    const setAuth = (userData: { id: number; email: string; username: string }) => {
        isAuthenticated.value = true
        user.value = userData
    }

    const clearAuth = () => {
        isAuthenticated.value = false
        user.value = null
    }

    // 初回ロード時にセッションを確認する処理
    const fetchSession = async () => {
        try {
            const { data, error } = await useFetch<{ user: User }>('/api/session', {
                method: 'GET',
                credentials: 'include',
            })

            if (error.value || !data.value?.user) {
                clearAuth()
                return
            }

            setAuth(data.value.user)
        } catch (e) {
            clearAuth()
        }
    }

    return {
        isAuthenticated,
        user,
        setAuth,
        clearAuth,
        fetchSession,
    }
}
