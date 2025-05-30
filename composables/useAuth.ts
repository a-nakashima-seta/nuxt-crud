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
