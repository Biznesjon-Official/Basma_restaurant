'use client'

import { useState } from 'react'
import { Plus, Trash2, ArrowRight, ArrowLeft, Check, AlertCircle, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface RecipeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItems: any[]
  inventory: any[]
  editingRecipe: any
  onSubmit: (data: any) => Promise<void>
}

export function RecipeModal({
  open,
  onOpenChange,
  menuItems,
  inventory,
  editingRecipe,
  onSubmit
}: RecipeModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedMenuItem, setSelectedMenuItem] = useState('')
  const [ingredients, setIngredients] = useState<any[]>([
    { inventoryItem: '', quantity: '', unit: 'g' }
  ])
  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const steps = [
    { number: 1, title: 'Taom', description: 'Taomni tanlang' },
    { number: 2, title: 'Masalliqlar', description: 'Masalliqlarni qo\'shing' },
  ]

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
    if (validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
    setErrors({})
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

    setIsSubmitting(true)
    
    try {
      await onSubmit({
        menuItem: selectedMenuItem,
        ingredients: ingredients.filter(i => i.inventoryItem && i.quantity)
      })
      
      setShowSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        resetForm()
      }, 1500)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setSelectedMenuItem('')
    setIngredients([{ inventoryItem: '', quantity: '', unit: 'g' }])
    setErrors({})
    setShowSuccess(false)
  }

  const selectedMenu = menuItems.find(m => m._id === selectedMenuItem)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-24 rounded-full bg-green-100 animate-ping"></div>
              </div>
              <div className="relative flex items-center justify-center size-24 rounded-full bg-green-500">
                <Check className="size-12 text-white" strokeWidth={3} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Muvaffaqiyatli!
            </h3>
            <p className="text-gray-600">
              Retsept yaratildi va saqlandi
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b bg-gradient-to-r from-orange-50 to-amber-50">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {editingRecipe ? 'Retseptni tahrirlash' : 'Yangi retsept yaratish'}
              </DialogTitle>
              <p className="text-sm text-gray-600 mb-6">
                Taom uchun kerakli masalliqlar va miqdorlarni kiriting
              </p>
              
              {/* Steps */}
              <div className="flex items-center gap-4">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn(
                        "flex items-center justify-center size-10 rounded-full font-semibold transition-all",
                        currentStep >= step.number
                          ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                          : "bg-gray-200 text-gray-500"
                      )}>
                        {currentStep > step.number ? (
                          <Check className="size-5" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={cn(
                          "text-sm font-semibold",
                          currentStep >= step.number ? "text-gray-900" : "text-gray-500"
                        )}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "h-0.5 w-full transition-all",
                        currentStep > step.number ? "bg-orange-600" : "bg-gray-200"
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto px-8 py-6">
                {/* Step 1: Select Menu Item */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900">
                        Taomni tanlang *
                      </Label>
                      <Select value={selectedMenuItem} onValueChange={setSelectedMenuItem}>
                        <SelectTrigger className={cn(
                          "h-14 text-base border-2 transition-all",
                          errors.menuItem ? "border-red-500" : "border-gray-200 hover:border-orange-300"
                        )}>
                          <SelectValue placeholder="Taomni tanlang..." />
                        </SelectTrigger>
                        <SelectContent>
                          {menuItems.map((item) => (
                            <SelectItem key={item._id} value={item._id} className="py-3">
                              <div className="flex items-center justify-between gap-4 w-full">
                                <span className="font-medium">{item.name}</span>
                                {item.price && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.price.toLocaleString()} so'm
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.menuItem && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="size-4" />
                          {errors.menuItem}
                        </div>
                      )}
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Sparkles className="size-4" />
                        Agar taom yo'q bo'lsa, avval Menu bo'limidan qo'shing
                      </p>
                    </div>

                    {selectedMenu && (
                      <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center size-12 rounded-xl bg-orange-600 text-white">
                            <Check className="size-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {selectedMenu.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {selectedMenu.description || 'Taom tanlandi'}
                            </p>
                            <div className="flex items-center gap-3">
                              {selectedMenu.price && (
                                <Badge className="bg-white text-gray-900 border border-gray-200">
                                  {selectedMenu.price.toLocaleString()} so'm
                                </Badge>
                              )}
                              {selectedMenu.category && (
                                <Badge variant="outline">
                                  {selectedMenu.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Add Ingredients */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold text-gray-900">
                          Masalliqlar *
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          1 porsiya uchun kerakli masalliqlar va miqdorlar
                        </p>
                      </div>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={handleAddIngredient}
                        className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        <Plus className="size-4 mr-1" />
                        Qo'shish
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {ingredients.map((ing, index) => (
                        <div 
                          key={index} 
                          className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-orange-200 transition-all"
                        >
                          <div className="flex gap-3 items-start">
                            <div className="flex-1 grid grid-cols-12 gap-3">
                              <div className="col-span-6">
                                <Select
                                  value={ing.inventoryItem}
                                  onValueChange={(value) => handleIngredientChange(index, 'inventoryItem', value)}
                                >
                                  <SelectTrigger className="h-11 border-2">
                                    <SelectValue placeholder="Masalliq tanlang..." />
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
                              
                              <div className="col-span-3">
                                <Input
                                  type="number"
                                  placeholder="Miqdor"
                                  value={ing.quantity}
                                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                                  className="h-11 border-2"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              
                              <div className="col-span-3">
                                <Select
                                  value={ing.unit}
                                  onValueChange={(value) => handleIngredientChange(index, 'unit', value)}
                                >
                                  <SelectTrigger className="h-11 border-2">
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
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveIngredient(index)}
                              disabled={ingredients.length === 1}
                              className="h-11 w-11 shrink-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {errors.ingredients && (
                      <div className="flex items-center gap-2 text-sm text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
                        <AlertCircle className="size-4" />
                        {errors.ingredients}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t bg-gray-50">
                <div className="flex items-center justify-between gap-4">
                  {currentStep === 1 ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => onOpenChange(false)}
                      className="h-12 px-6 border-2"
                    >
                      Bekor qilish
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleBack}
                      className="h-12 px-6 border-2"
                    >
                      <ArrowLeft className="size-4 mr-2" />
                      Orqaga
                    </Button>
                  )}

                  {currentStep === 1 ? (
                    <Button 
                      type="button"
                      onClick={handleNext}
                      className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30"
                    >
                      Keyingisi
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saqlanmoqda...
                        </>
                      ) : (
                        <>
                          <Check className="size-4 mr-2" />
                          Yaratish
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
