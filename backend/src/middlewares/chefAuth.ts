import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

// Log chef actions
// RBAC: ALL chef actions MUST be logged
export const logChefAction = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // SECURITY: Log all chef actions for audit trail
      console.log('👨‍🍳 RBAC Chef Action:', {
        action,
        chef: req.user?.userId,
        role: req.user?.role,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('user-agent'),
        params: req.params,
        body: req.body,
      })
      
      // Store original send function
      const originalSend = res.json.bind(res)
      
      // Override send to log response
      res.json = function(data: any) {
        console.log('📤 RBAC Chef Action Result:', {
          action,
          chef: req.user?.userId,
          success: data.success,
          timestamp: new Date().toISOString(),
        })
        return originalSend(data)
      }
      
      next()
    } catch (error) {
      console.error('❌ Logging error:', error)
      next() // Don't block the request if logging fails
    }
  }
}
