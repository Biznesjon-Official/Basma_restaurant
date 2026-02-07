'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ChefHat, CheckCircle, Zap, ArrowRight, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function RecipesPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<any>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState('')
  const [ingredients, setIngredients] = useState<any[]>([
    { inventoryItem: '', quantity: '', unit: 'g' }
  ])
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<any>({})
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

      // Load recipes
      const recipesRes = await fetch(`${apiUrl}/storekeeper/recipes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const recipesData = await recipesRes.json()
      setRecipes(recipesData.data || [])

      // Load menu items
      const menuRes = await fetch(`${apiUrl}/menu`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const menuData = await menuRes.json()
      setMenuItems(menuData.data || [])

      // Load inventory
      const invRes = await fetch(`${apiUrl}/inventory?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const invData = await invRes.json()
      setInventory(invData.data || [])
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error)
      toast.error('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { inventoryItem: '', quantity: '', unit: 'g' }])
  }

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleIngredientChange = (index: number, field: string, value: any) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep2()) return

    const validIngredients = ingredients.filter(
      ing => ing.inventoryItem && ing.quantity
    )

    if (validIngredients.length === 0) {
      toast.error('Kamida 1 ta masalliq qo\'shing')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

      const data = {
        menuItem: selectedMenuItem,
        ingredients: validIngredients.map(ing => ({
          inventoryItem: ing.inventoryItem,
          quantity: parseFloat(ing.quantity),
          unit: ing.unit
        })),
        portionSize: 1
      }

      const url = editingRecipe
        ? `${apiUrl}/storekeeper/recipes/${editingRecipe._id}`
        : `${apiUrl}/storekeeper/recipes`

      const response = await fetch(url, {
        method: editingRecipe ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => {
          toast.success(editingRecipe ? 'Retsept yangilandi!' : 'Retsept yaratildi!')
          setIsDialogOpen(false)
          resetForm()
          loadData()
        }, 1500)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Xatolik:', error)
      toast.error('Xatolik yuz berdi')
    }
  }

  const handleEdit = (recipe: any) => {
    setEditingRecipe(recipe)
    setSelectedMenuItem(recipe.menuItem._id)
    setIngredients(recipe.ingredients.map((ing: any) => ({
      inventoryItem: ing.inventoryItem._id,
      quantity: ing.quantity.toString(),
      unit: ing.unit
    })))
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Retseptni o\'chirmoqchimisiz?')) return

    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

      const response = await fetch(`${apiUrl}/storekeeper/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Retsept o\'chirildi!')
        loadData()
      } else {
        toast.error('Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Xatolik:', error)
      toast.error('Xatolik yuz berdi')
    }
  }

  const resetForm = () => {
    setEditingRecipe(null)
    setSelectedMenuItem('')
    setIngredients([{ inventoryItem: '', quantity: '', unit: 'g' }])
    setCurrentStep(1)
    setErrors({})
    setShowSuccess(false)
  }

  const validateStep1 = () => {
    if (!selectedMenuItem) {
      setErrors({ menuItem: 'Taomni tanlang' })
      return false
    }
    setErrors({})
    return true
  }

  const validateStep2 = () => {
    const validIngredients = ingredients.filter(
      ing => ing.inventoryItem && ing.quantity
    )
    if (validIngredients.length === 0) {
      setErrors({ ingredients: 'Kamida 1 ta masalliq qo\'shing' })
      return false
    }
    setErrors({})
    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
    setErrors({})
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header with better spacing and hierarchy */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Texnologik Kartalar</h1>
                <p className="text-sm text-muted-foreground">
                  Har bir taom uchun kerakli masalliqlar va avtomatik write-off tizimi
                </p>
              </div>
              <Button 
                onClick={() => {
                  resetForm()
                  setIsDialogOpen(true)
                }}
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30 h-12 px-6"
              >
                <Plus className="mr-2 size-5" />
                Yangi Retsept
              </Button>
            </div>

            {/* Stats Cards - Improved Colors */}
            {recipes.length > 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
                      <ChefHat className="size-7 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-900">{recipes.length}</div>
                      <div className="text-sm font-medium text-blue-700">Jami retseptlar</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
                      <CheckCircle className="size-7 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-emerald-900">
                        {recipes.reduce((sum, r) => sum + (r.ingredients?.length || 0), 0)}
                      </div>
                      <div className="text-sm font-medium text-emerald-700">Jami masalliqlar</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/30">
                      <Zap className="size-7 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-amber-900">Auto</div>
                      <div className="text-sm font-medium text-amber-700">Write-off faol</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recipes Table with improved empty state */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Retseptlar ro'yxati</CardTitle>
                  {recipes.length > 0 && (
                    <Badge variant="secondary" className="text-sm">
                      {recipes.length} ta retsept
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                      <div className="size-16 rounded-full border-4 border-muted"></div>
                      <div className="absolute inset-0 size-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
                  </div>
                ) : recipes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-32 rounded-full bg-orange-100"></div>
                      </div>
                      <div className="relative flex items-center justify-center">
                        <ChefHat className="size-20 text-orange-600" strokeWidth={1.5} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">
                      Hozircha retseptlar yo'q
                    </h3>
                    <p className="text-center text-gray-600 mb-8 max-w-md leading-relaxed">
                      Birinchi texnologik kartani yarating va avtomatik write-off tizimidan foydalaning. 
                      Har bir sotilgan taom uchun masalliqlar avtomatik ombordan kamayadi.
                    </p>
                    <Button 
                      onClick={() => {
                        resetForm()
                        setIsDialogOpen(true)
                      }}
                      size="lg"
                      className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30 h-12 px-8"
                    >
                      <Plus className="mr-2 size-5" />
                      Birinchi Retseptni Yaratish
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Taom</TableHead>
                        <TableHead>Masalliqlar</TableHead>
                        <TableHead>Porsiya</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipes.map((recipe) => (
                        <TableRow key={recipe._id}>
                          <TableCell className="font-medium">
                            {recipe.menuItem?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {recipe.ingredients?.slice(0, 3).map((ing: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  • {ing.inventoryItem?.name}: {ing.quantity}{ing.unit}
                                </div>
                              ))}
                              {recipe.ingredients?.length > 3 && (
                                <div className="text-sm text-muted-foreground">
                                  +{recipe.ingredients.length - 3} ta yana...
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{recipe.portionSize} porsiya</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(recipe)}
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(recipe._id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Dialog - Improved */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingRecipe ? 'Retseptni tahrirlash' : 'Yangi retsept yaratish'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Taom uchun kerakli masalliqlar va miqdorlarni kiriting
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Menu Item - Full Width */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Taom *</Label>
                <Select value={selectedMenuItem} onValueChange={setSelectedMenuItem}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Taomni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuItems.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.price ? `${item.price.toLocaleString()} so'm` : 'Narx yo\'q'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Agar taom yo'q bo'lsa, avval Menu bo'limidan qo'shing
                </p>
              </div>

              {/* Ingredients - Improved Layout */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Masalliqlar *</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      1 porsiya uchun kerakli masalliqlar
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={handleAddIngredient}
                    className="shadow-sm"
                  >
                    <Plus className="size-4 mr-1" />
                    Qo'shish
                  </Button>
                </div>
                
                <div className="space-y-3 rounded-lg border-2 border-gray-200 p-5 bg-white shadow-sm">
                  {ingredients.map((ing, index) => (
                    <div key={index} className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex-1 grid grid-cols-12 gap-3">
                        {/* Ingredient - 6 cols */}
                        <div className="col-span-6">
                          <Select
                            value={ing.inventoryItem}
                            onValueChange={(value) => handleIngredientChange(index, 'inventoryItem', value)}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Masalliq" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventory.map((item) => (
                                <SelectItem key={item._id} value={item._id}>
                                  <div className="flex items-center gap-2">
                                    <span>{item.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {item.unit}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Quantity - 3 cols */}
                        <div className="col-span-3">
                          <Input
                            type="number"
                            placeholder="Miqdor"
                            value={ing.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                            className="h-10"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        
                        {/* Unit - 3 cols */}
                        <div className="col-span-3">
                          <Select
                            value={ing.unit}
                            onValueChange={(value) => handleIngredientChange(index, 'unit', value)}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="g">Gramm (g)</SelectItem>
                              <SelectItem value="kg">Kilogramm (kg)</SelectItem>
                              <SelectItem value="ml">Millilitr (ml)</SelectItem>
                              <SelectItem value="l">Litr (l)</SelectItem>
                              <SelectItem value="dona">Dona</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveIngredient(index)}
                        disabled={ingredients.length === 1}
                        className="h-10 w-10 shrink-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {ingredients.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      Masalliq qo'shing
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="h-11 px-6 border-gray-300"
                >
                  Bekor qilish
                </Button>
                <Button 
                  type="submit"
                  className="h-11 px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30"
                  disabled={!selectedMenuItem || ingredients.filter(i => i.inventoryItem && i.quantity).length === 0}
                >
                  {editingRecipe ? 'Yangilash' : 'Yaratish'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
