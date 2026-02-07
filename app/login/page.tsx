'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Format phone number for display: 90 949 78 78
  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as XX XXX XX XX
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
  }

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove all non-digits
    const digits = input.replace(/\D/g, '')
    
    // Limit to 9 digits (after +998)
    const limitedDigits = digits.slice(0, 9)
    
    // Update form data with just the digits
    setFormData({ ...formData, phone: limitedDigits })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      
      // Send phone without any prefix (backend will handle normalization)
      const loginData = {
        phone: formData.phone,
        password: formData.password,
      }
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Save token and user data
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      // RBAC: Redirect based on role
      const userRole = data.data.user.role
      if (userRole === 'waiter') {
        router.push('/waiter')
      } else if (userRole === 'chef') {
        router.push('/kitchen')
      } else if (userRole === 'storekeeper') {
        router.push('/storekeeper')
      } else {
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || 'Tizimga kirishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-3xl font-bold text-primary">B</span>
          </div>
          <CardTitle className="text-2xl font-bold">BASMA Osh Markazi</CardTitle>
          <CardDescription>Admin panelga kirish uchun ma&apos;lumotlaringizni kiriting</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon raqam</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  +998
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="90 123 45 67"
                  value={formatPhoneDisplay(formData.phone)}
                  onChange={handlePhoneChange}
                  className="pl-14"
                  required
                  disabled={loading}
                  maxLength={14}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                'Kirish'
              )}
            </Button>

            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">Test uchun:</p>
              <p className="text-muted-foreground">Telefon: 90 111 11 11</p>
              <p className="text-muted-foreground">Parol: admin123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
