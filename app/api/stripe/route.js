import Stripe from 'stripe'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

const PRICE_ID_LIST = [
    { key: 'basic', value: 'price_1RQMR0Psq011JgrIqqzrzjPR' },
    { key: 'pro', value: 'price_1RQMRLPsq011JgrImNCwJTre' },
]

export const POST = async (req, res) => {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "You must be logged in." }, { status: 401 })
    }

    if (req.method === "POST") {
        try {
            const { userId, type } = await req.json()

            let price_id = PRICE_ID_LIST.find(i => i.key === type)?.value
            const params = {
                submit_type: 'pay',
                mode: 'payment',
                payment_method_types: ['card'],
                client_reference_id: userId,
                line_items: [
                    {
                        price: price_id,
                        quantity: 1,
                    },
                ],
                success_url: `${req.headers.get("origin")}/success`,
                cancel_url: `${req.headers.get("origin")}/canceled`,
            }
            // Create Checkout Sessions from body params.
            const session = await stripe.checkout.sessions.create(params);

            return new Response(JSON.stringify(session), { status: 200 });
        } catch (err) {
            return new Response("Failed to checkout", { status: 500 });

        }
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
        return new Response("Method Not Allowed", { status: 405 })
    }
}