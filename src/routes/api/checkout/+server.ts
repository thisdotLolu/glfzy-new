import { PRIVATE_STRIPE_SECRET_KEY } from '$env/static/private'
import { PUBLIC_APP_URL } from '$env/static/public';
import { json } from '@sveltejs/kit'
import Stripe from 'stripe'

const stripe = new Stripe(PRIVATE_STRIPE_SECRET_KEY);

export async function POST({request,locals}){
    console.log(request)
    const {priceId,userId,subTier} = await request.json()


    const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        customer_email:(await locals.supabase.auth.getSession()).data.session?.user.email,
        line_items:[
            {
                price:priceId,
                quantity: 1
            }
        ],
        mode:'subscription',
        success_url: `${PUBLIC_APP_URL}/checkout/success`,
        cancel_url: `${PUBLIC_APP_URL}/checkout/failure`
    })

    const { data, error } = await locals.supabase
        .from('users')
        .update({
            subscription_tier: subTier,
            subscription_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating subscription:', error);
        return json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    console.log(data)
    console.log(session)
    return json({sessionId:session.id})
}