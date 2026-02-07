import { Router } from 'express'
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipeByMenuItem,
} from '../controllers/recipeController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// RBAC: Admin va Storekeeper texnologik kartalarni boshqarishi mumkin
router.use(authenticate, authorize('admin', 'storekeeper'))

router.get('/', getRecipes)
router.get('/:id', getRecipeById)
router.get('/menu-item/:menuItemId', getRecipeByMenuItem)
router.post('/', createRecipe)
router.put('/:id', updateRecipe)
router.delete('/:id', deleteRecipe)

export default router
