import { Schema, model, models } from "mongoose"
import { getCurrentTime } from '@/lib/utils';
const OrderSchema = new Schema({
    userId: {
        type: String,
        required: [true, "userId is required"],
    },
    price: {
        type: Number
    },
    product: {
        type: String,
        require: [true, "Product is required"]
    },
    payEmail: {
        type: String,
    },
    payName: {
        type: String,
    },
    payCurrency: {
        type: String,
    },
    createDate: {
        type: String,
    },
    updateDate: {
        type: String,
        default: getCurrentTime()
    },

})
const Order = models.Order || model("Order", OrderSchema)
export default Order