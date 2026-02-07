'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function TableDetailPage() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Redirect to new order page for this table
    router.push(`/waiter/new-order?table=${params.id}`)
  }, [params.id, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Yuklanmoqda...</div>
    </div>
  )
}
