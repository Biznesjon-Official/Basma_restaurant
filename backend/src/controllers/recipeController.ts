import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Recipe from '../models/Recipe'
import MenuItem from '../models/MenuItem'
import Inventory from '../models/Inventory'

// Get all recipes
export const getRecipes = async (req: AuthRequest, res: Response) => {
  try {
    const recipes = await Recipe.find()
      .populate('menuItem', 'name category')
      .populate('ingredients.inventoryItem', 'name unit')
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName')
      .sort({ createdAt: -1 })

    res.json({ success: true, data: recipes })
  } catch (error: any) {
    console.error('Get recipes error:', error)
    res.status(500).json({ success: false, error: 'Texnologik kartalarni olishda xatolik' })
  }
}

// Get recipe by ID
export const getRecipeById = async (req: AuthRequest, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('menuItem', 'name category price')
      .populate('ingredients.inventoryItem', 'name unit quantity')
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName')

    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Texnologik karta topilmadi' })
    }

    res.json({ success: true, data: recipe })
  } catch (error: any) {
    console.error('Get recipe error:', error)
    res.status(500).json({ success: false, error: 'Texnologik kartani olishda xatolik' })
  }
}

// Get recipe by menu item
export const getRecipeByMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const recipe = await Recipe.findOne({ menuItem: req.params.menuItemId })
      .populate('menuItem', 'name category price')
      .populate('ingredients.inventoryItem', 'name unit quantity')
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName')

    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Texnologik karta topilmadi' })
    }

    res.json({ success: true, data: recipe })
  } catch (error: any) {
    console.error('Get recipe by menu item error:', error)
    res.status(500).json({ success: false, error: 'Texnologik kartani olishda xatolik' })
  }
}

// Create recipe
export const createRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { menuItem, ingredients, portionSize, notes } = req.body
    const userId = req.user?.userId

    // Check if menu item exists
    const menuItemExists = await MenuItem.findById(menuItem)
    if (!menuItemExists) {
      return res.status(404).json({ success: false, error: 'Taom topilmadi' })
    }

    // Check if recipe already exists for this menu item
    const existingRecipe = await Recipe.findOne({ menuItem })
    if (existingRecipe) {
      return res.status(400).json({
        success: false,
        error: 'Bu taom uchun texnologik karta allaqachon mavjud',
      })
    }

    // Validate ingredients
    for (const ingredient of ingredients) {
      const inventoryItem = await Inventory.findById(ingredient.inventoryItem)
      if (!inventoryItem) {
        return res.status(404).json({
          success: false,
          error: `Ombor mahsuloti topilmadi: ${ingredient.inventoryItem}`,
        })
      }
    }

    const recipe = await Recipe.create({
      menuItem,
      ingredients,
      portionSize: portionSize || 1,
      notes,
      createdBy: userId,
      updatedBy: userId,
    })

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('menuItem', 'name category')
      .populate('ingredients.inventoryItem', 'name unit')
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName')

    res.status(201).json({ success: true, data: populatedRecipe })
  } catch (error: any) {
    console.error('Create recipe error:', error)
    res.status(500).json({ success: false, error: 'Texnologik karta yaratishda xatolik' })
  }
}

// Update recipe
export const updateRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { ingredients, portionSize, notes } = req.body
    const userId = req.user?.userId

    const recipe = await Recipe.findById(req.params.id)
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Texnologik karta topilmadi' })
    }

    // Validate ingredients if provided
    if (ingredients) {
      for (const ingredient of ingredients) {
        const inventoryItem = await Inventory.findById(ingredient.inventoryItem)
        if (!inventoryItem) {
          return res.status(404).json({
            success: false,
            error: `Ombor mahsuloti topilmadi: ${ingredient.inventoryItem}`,
          })
        }
      }
      recipe.ingredients = ingredients
    }

    if (portionSize !== undefined) recipe.portionSize = portionSize
    if (notes !== undefined) recipe.notes = notes
    recipe.updatedBy = userId!

    await recipe.save()

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('menuItem', 'name category')
      .populate('ingredients.inventoryItem', 'name unit')
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName')

    res.json({ success: true, data: populatedRecipe })
  } catch (error: any) {
    console.error('Update recipe error:', error)
    res.status(500).json({ success: false, error: 'Texnologik kartani yangilashda xatolik' })
  }
}

// Delete recipe
export const deleteRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id)

    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Texnologik karta topilmadi' })
    }

    res.json({ success: true, message: 'Texnologik karta o\'chirildi' })
  } catch (error: any) {
    console.error('Delete recipe error:', error)
    res.status(500).json({ success: false, error: 'Texnologik kartani o\'chirishda xatolik' })
  }
}
