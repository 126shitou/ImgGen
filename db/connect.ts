import mongoose from "mongoose";

let isConnected = false // Track the connection

export const connectToMongoDB = async () => {
    mongoose.set('strictQuery', true)

    if (isConnected) {
        console.log("MongoDB is connected successfully!")
        return
    }

    try {
        await mongoose.connect(process.env.DB_URL || "", {
            dbName: "ImageGenDb",
        })

        isConnected = true

        console.log("MongoDB connected")
    } catch (err) {
        console.log(err)
    }
}

/**
 * Closes the MongoDB connection gracefully
 * @returns {Promise<void>}
 */
export const disconnectFromMongoDB = async () => {
    if (!isConnected) {
        console.log("No MongoDB connection to close")
        return
    }
    
    try {
        await mongoose.disconnect()
        isConnected = false
        console.log("MongoDB disconnected successfully")
    } catch (err) {
        console.error("Error disconnecting from MongoDB:", err)
    }
}