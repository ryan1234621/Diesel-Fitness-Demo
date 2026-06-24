import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Stripe will be initialized inside the handler to prevent build-time evaluation errors

export async function POST(request: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string || 'dummy', {
      apiVersion: '2026-05-27.dahlia', // Stripe api version
    });
    
    const body = await request.json();
    const { firstName, lastName, email, goal, experience, commitment, limitations } = body;
    
    // We need the STRIPE_PRICE_ID from env
    const priceId = process.env.STRIPE_PRICE_ID;
    
    if (!priceId) {
      console.error('STRIPE_PRICE_ID environment variable is not defined');
      return NextResponse.json(
        { error: 'Stripe Product/Price not configured' },
        { status: 500 }
      );
    }
    
    // Extract origin for absolute URLs in the redirect
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email, // Pre-fills the email field
      success_url: `${origin}/apply/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
      // Attach form data so the Stripe webhook sends it to n8n
      metadata: {
        firstName,
        lastName,
        goal,
        experience,
        commitment,
        limitations: limitations || 'None',
      },
    });

    if (!session.url) {
      throw new Error('Failed to create Stripe session URL');
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating Stripe session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
