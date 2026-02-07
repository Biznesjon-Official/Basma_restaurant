'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const publicPaths = ['/login']
    const isPublicPath = publicPaths.includes(pathname)

    if (!token && !isPublicPath) {
      router.push('/login')
    }
  }, [pathname, router])

  return <>{children}</>
}
