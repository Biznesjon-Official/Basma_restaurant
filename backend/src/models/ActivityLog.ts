import mongoose, { Document, Schema } from 'mongoose'

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId
  action: string
  entity: string
  entityId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'create',
        'update',
        'delete',
        'login',
        'logout',
        'view',
        'export',
        'status_change',
      ],
    },
    entity: {
      type: String,
      required: true,
      enum: ['user', 'menu', 'order', 'table', 'inventory', 'settings'],
    },
    entityId: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
activityLogSchema.index({ user: 1, createdAt: -1 })
activityLogSchema.index({ entity: 1, createdAt: -1 })
activityLogSchema.index({ action: 1, createdAt: -1 })

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema)
