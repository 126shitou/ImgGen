import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTime } from '@/lib/utils';
import User from '@/models/User';
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {

    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    try {
        const body = await request.json();
        const { userId, formData } = body;
        const token = process.env.NEXT_PUBLIC_TK;

        if (!token) {
            return NextResponse.json(
                { error: 'API token not configured' },
                { status: 500 }
            );
        }

        if (!userId || !formData) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // BUG 暂定生成一次消耗1点
        // 计算所需费用 - 每个字符0.1点
        const requiredBalance = 1;

        // 获取用户信息和余额
        const dbUser = await User.findOne({ id: userId });
        console.log("dbUser", dbUser);

        if (!dbUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // 检查用户余额是否足够
        if (dbUser.balance < requiredBalance) {
            return NextResponse.json(
                {
                    error: 'Insufficient balance',
                    requiredBalance: requiredBalance.toFixed(1),
                    currentBalance: dbUser.balance.toFixed(1)
                },
                { status: 402 }
            );
        }

        // 调用Replicate API创建预测
        const replicateResponse = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
            method: 'POST',
            headers: {
                'Prefer': 'wait',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                input: formData
            })
        });

        console.log("replicateResponse", replicateResponse);


        if (!replicateResponse.ok) {
            return NextResponse.json(
                { error: `Failed to create prediction: ${replicateResponse.status}` },
                { status: replicateResponse.status }
            );
        }

        const prediction = await replicateResponse.json();
        console.log('Prediction created:', prediction.id);

        // 轮询获取结果
        let completed;
        const maxAttempts = 15; // 最大轮询次数
        const pollingInterval = 2000; // 轮询间隔（毫秒）

        for (let i = 0; i < maxAttempts; i++) {
            const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!statusResponse.ok) {
                return NextResponse.json(
                    { error: `Failed to check prediction status: ${statusResponse.status}` },
                    { status: statusResponse.status }
                );
            }

            const latest = await statusResponse.json();
            console.log(`Polling attempt ${i + 1}/${maxAttempts}, status: ${latest.status}`);

            // 检查处理是否完成
            if (latest.status !== "starting" && latest.status !== "processing") {
                completed = latest;
                break;
            }

            // 等待下一次轮询
            await new Promise(resolve => setTimeout(resolve, pollingInterval));
        }

        if (!completed) {
            return NextResponse.json(
                { error: 'Processing timed out. Please try again.' },
                { status: 408 }
            );
        }

        // 检查是否有输出
        if (!completed.output) {
            return NextResponse.json(
                { error: 'No output was generated.' },
                { status: 500 }
            );
        }

        // 计算并扣除用户余额
        const usedBalance = 1;
        const newBalance = (dbUser.balance - usedBalance).toFixed(2);

        // 更新用户余额
        await User.findOneAndUpdate(
            { id: userId },
            { $set: { balance: parseFloat(newBalance) } }
        );

        // 获取图片内容
        const imageUrls = Array.isArray(completed.output) ? completed.output : [completed.output];
        const images = [];

        for (const url of imageUrls) {
            const imageResponse = await fetch(url);
            if (!imageResponse.ok) {
                console.error(`Failed to fetch image from ${url}: ${imageResponse.status}`);
                continue;
            }

            // 获取图片的二进制数据
            const imageBuffer = await imageResponse.arrayBuffer();

            let contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
            if (imageResponse.headers.get('content-type') === 'application/octet-stream') contentType = 'webp'

            // 将图片转换为Base64
            const base64 = Buffer.from(imageBuffer).toString('base64');
            images.push(`data:${contentType};base64,${base64}`);
        }


        // 返回生成的图片结果
        return NextResponse.json(images, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error) {
        console.error('Error processing prediction:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

