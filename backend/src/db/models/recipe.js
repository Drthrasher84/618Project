import mongoose from 'mongoose'

const { Schema } = mongoose

const recipeSchema = new Schema(
  {
    title: { type: String, required: true },
    ingredients: {
      type: [String],
      required: true,
    },
    steps: String,
    imageUrl: String,
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
)

recipeSchema.virtual('likesCount').get(function () {
  return this.likes.length
})

recipeSchema.set('toJSON', { virtuals: true })
recipeSchema.set('toObject', { virtuals: true })

export const Recipe = mongoose.model('Recipe', recipeSchema)
