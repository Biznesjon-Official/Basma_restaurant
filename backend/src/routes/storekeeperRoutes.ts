import { Router } from 'express'
import {
  // Recipes
  getRecipes,
  getRecipeByMenuItem,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  // Receive
  receiveInventory,
  // Low Stock
  getLowStockItems,
  updateMinQuantity,
  // Audit
  performAudit,
  getAuditHistory,
  // Reports
  getTransactions,
  getInventoryReport,
  getCostAnalysis,
} from '../controllers/storekeeperController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// All routes require storekeeper authentication
const storekeeperAuth = [authenticate, authorize('storekeeper', 'admin')]

// ==================== RECIPES ====================
router.get('/recipes', storekeeperAuth, getRecipes)
router.get('/recipes/menu/:menuItemId', storekeeperAuth, getRecipeByMenuItem)
router.post('/recipes', storekeeperAuth, createRecipe)
router.put('/recipes/:id', storekeeperAuth, updateRecipe)
router.delete('/recipes/:id', storekeeperAuth, deleteRecipe)

// ==================== INVENTORY ====================
router.post('/inventory/receive', storekeeperAuth, receiveInventory)
router.get('/inventory/low-stock', storekeeperAuth, getLowStockItems)
router.put('/inventory/:id/min-quantity', storekeeperAuth, updateMinQuantity)

// ==================== AUDIT ====================
router.post('/inventory/audit', storekeeperAuth, performAudit)
router.get('/inventory/audit-history', storekeeperAuth, getAuditHistory)

// ==================== REPORTS ====================
router.get('/inventory/transactions', storekeeperAuth, getTransactions)
router.get('/inventory/report', storekeeperAuth, getInventoryReport)
router.get('/inventory/cost-analysis', storekeeperAuth, getCostAnalysis)

export default router
