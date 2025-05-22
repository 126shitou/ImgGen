import { NextRequest, NextResponse } from 'next/server';

import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/mongoose';
import User from '@/models/User'
import Order from '@/models/Order'
import { getCurrentTime } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-04-30.basil"
})


const PRODUCT_TOKEN_LIST = [
    { key: 'prod_SL2WEtUTGlLgST', value: 100 },
    { key: 'prod_SL2Wik94PZXSNa', value: 700 }
]

export async function POST(req: NextRequest) {

    try {

        const rawBody = await req.text()
        const signature = req.headers.get("stripe-signature") || ""

        const event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_KEY || ""
        )

        if (event.type === "checkout.session.completed") {
            const session = event.data.object
            const line_items = await stripe.checkout.sessions.listLineItems(session.id);
            await connectToDatabase();
 
            const user = await User.findById(session.client_reference_id)
            if (user) {
                const promises = line_items.data.map(async (ele) => {
                    const pId = ele.price?.product
                    let v = PRODUCT_TOKEN_LIST.find(i => i.key === pId)?.value || 0
                    user.balance += v
                    const order = new Order({
                        userId: session.client_reference_id,
                        price: session.amount_total,
                        payCurrency: session.currency,
                        payName: session.customer_details?.name,
                        payEmail: session.customer_details?.email,
                        product: pId,
                        createDate: getCurrentTime()
                    })
                    return order.save()
                });

                await Promise.all(promises);

                await user.save();
            }

            return new Response('success', { status: 200 })
        }
        return new Response('method not found', { status: 404 })


    } catch (e) {
        console.log("error", e);
        return new Response(JSON.stringify({ error: 'Failed to update' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

}
