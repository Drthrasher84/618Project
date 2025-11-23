// backend/src/db/connect.js
import mongoose from 'mongoose'

export async function connectDb() {
  const uri = process.env.DATABASE_URL
  if (!uri) {
    throw new Error('DATABASE_URL is missing in .env')
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    throw err
  }
}
