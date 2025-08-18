// components/signout-button.tsx
'use client'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { IconLogout } from '@tabler/icons-react'

export function SignOutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await authClient.signOut()
            // Refresh router untuk update state server
            router.refresh()
            // Redirect ke halaman login setelah refresh
            // router.push('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <button
            onClick={handleLogout}
            className="w-full text-left flex items-center"
        >
            <IconLogout className="w-4 h-4 mr-2" />
            Logout
        </button>
    )
}