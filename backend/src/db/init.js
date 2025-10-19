import mongoose from 'mongoose'
const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/recipes'
export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(url)
  console.log('MongoDB connected')
}
