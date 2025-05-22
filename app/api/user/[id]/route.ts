import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User'
import { connectToDatabase } from '@/lib/mongoose';
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth-options';

type IParams = {
    params: {
        id: string
    }
}

// 获取用户信息
export const GET = async (req: NextRequest, { params }: IParams) => {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    try {
        await connectToDatabase();
        const user = await User.findById(params.id);

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("API:/api/user/[id]=>get error=>", error);
        return new Response(JSON.stringify({ error: 'Failed to fetch user' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

