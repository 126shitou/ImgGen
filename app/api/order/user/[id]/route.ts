import type { NextRequest } from 'next/server';
import Order from '@/models/Order';
import { connectToDatabase } from '@/lib/mongoose';
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth-options';
import { NextResponse } from "next/server"

type IParams = {
    params: {
        id: string
    }
}

// 获取用户的订单历史
export const GET = async (req: NextRequest, { params }: IParams) => {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }
    try {
        await connectToDatabase();

        // 查找用户的所有订单并按创建日期降序排序
        const orders = await Order.find({ userId: params.id }).sort({ createDate: -1 });

        return new Response(JSON.stringify({
            success: true,
            orders
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("API:/api/order/user/[id]=>get error=>", error);
        return new Response(JSON.stringify({ error: 'Failed to fetch order history' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
