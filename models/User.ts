import { Schema, model, models } from "mongoose"
import { getCurrentTime } from '@/lib/utils';

const UserSchema = new Schema({
    thirdPartId: {
        type: String,
        unique: [true, "User Id alreay exists"],
    },
    name: {
        type: String,
        required: [true, "Username is required"],
    },
    email: {
        type: String,
        unique: [true, "Email already exists"],
        required: [true, "Email is required"],
    },
    image: {
        type: String
    },
    balance: {
        type: Number,
        default: 0
    },
    
    collect: {
        type: [String],
        default: []
    },
    
    createDate: {
        type: String,
    },
    updateDate: {
        type: String,
        default: getCurrentTime()
    },

})
const User = models.User || model("User", UserSchema)
export default User