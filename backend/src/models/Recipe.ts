import mongoose, { Schema, Document } from 'mongoose'

interface IIngredient {
  inventoryItem: mongoose.Types.ObjectId
  quantity: number // gramm yoki dona
  unit: string // g, kg, dona
}

export interface IRecipe extends Document {
  menuItem: mongoose.Types.ObjectId
  ingredients: IIngredient[]
  portionSize: number // 1 porsiya
  notes?: string
  createdBy: mongoose.Types.ObjectId
  updatedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const RecipeSchema = new Schema<IRecipe>(
  {
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
      unique: true,
      index: true,
    },
    ingredients: [
      {
        inventoryItem: {
          type: Schema.Types.ObjectId,
          ref: 'Inventory',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        unit: {
          type: String,
          required: true,
          enum: ['g', 'kg', 'ml', 'l', 'dona'],
        },
      },
    ],
    portionSize: {
      type: Number,
      default: 1,
      min: 1,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IRecipe>('Recipe', RecipeSchema)
