# Stripe Integration Plan (Transformation Plan)

## Goal
Integrate Stripe Checkout to collect payments when a user applies for the Transformation Plan via the onboarding modal. Once paid, Stripe will handle firing a webhook directly to n8n (containing all form answers). Users will then be redirected to a dedicated success page where they can book their session via Calendly.

## Proposed Flow

1. **User Completes Form (Steps 1-5):** The user fills out their Goals, Experience, Name, Email, and checks the GDPR consent box.
2. **Redirect to Stripe:** Upon clicking the CTA, our Next.js API (`/api/checkout`) creates a secure Stripe Checkout Session.
   - We attach all form answers into the Stripe session's `metadata`.
3. **Payment Completed:** The user completes the payment on Stripe's hosted checkout page.
4. **Stripe Webhook to n8n:** Stripe natively fires a `checkout.session.completed` webhook directly to the n8n workflow. 
   - *Because the user's answers were passed in the `metadata`, n8n receives the payment confirmation AND the user's onboarding answers in a single payload.*
5. **Calendly Booking (Success Page):** After successful payment, Stripe redirects the user to `/apply/success`. The Calendly widget is mounted here so the user can book their kickoff call.

## Environment Variables & Stripe Setup Guide

To make this work, the following environment variables must be added to your local `.env` file and your Vercel deployment. 

Here is exactly what you need and where to find it in your [Stripe Dashboard](https://dashboard.stripe.com/):

### 1. `STRIPE_SECRET_KEY`
- **What it is:** Your private API key used by the backend to securely create checkout sessions.
- **Where to find it:** 
  - Go to your Stripe Dashboard.
  - Click **Developers** (top right) -> **API keys**.
  - Look for "Secret key" (it starts with `sk_test_` or `sk_live_`). Click "Reveal test key" to copy it.

### 2. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **What it is:** Your public API key.
- **Where to find it:** 
  - Same page as above (**Developers -> API keys**).
  - Look for "Publishable key" (it starts with `pk_test_` or `pk_live_`).

### 3. `STRIPE_PRICE_ID`
- **What it is:** The unique ID for the "Transformation Plan" pricing tier.
- **How to create & find it:**
  - In Stripe, go to **Product Catalog** -> **Products** -> **Add product**.
  - Name it "Transformation Plan" and set your price (e.g., $199.00 One-time). Save the product.
  - After saving, scroll down to the "Pricing" section of that product.
  - You will see an API ID that starts with `price_` (e.g., `price_1PqYz2L...`). Copy that exact string.

### 4. `N8N_WEBHOOK_URL` (Optional / Override)
- The URL where Stripe should send the webhooks. *(Note: You configure this directly in the Stripe Dashboard under **Developers -> Webhooks**, so it doesn't necessarily need to be an environment variable in Next.js unless we use it for something else).*

## Implementation Checklist

- [ ] Add `stripe` to `package.json` and install.
- [ ] Create `/api/checkout/route.ts` with Stripe session creation logic.
- [ ] Modify `BookingOnboardingModal.tsx` to handle POST to `/api/checkout` and redirect to Stripe.
- [ ] Remove Calendly from Modal.
- [ ] Create `/apply/success/page.tsx` for post-payment and embed Calendly.
- [ ] Create and update GitHub issues for the work.

## Proposed Code Changes

1. **`src/app/api/checkout/route.ts` [NEW]**
   - A serverless function that accepts `formData`, initializes Stripe using `STRIPE_SECRET_KEY`, and creates a `stripe.checkout.sessions.create` object.
   - Embeds `metadata` with the user's answers.
   - Sets `success_url` to redirect the user to `/apply/success`.

2. **`src/components/booking/BookingOnboardingModal.tsx` [MODIFY]**
   - Update Step 5's submission logic to `POST` to `/api/checkout` instead of the previous n8n route.
   - Change the button text (e.g. "Continue to Payment").
   - Upon receiving the Stripe Checkout URL from our API, redirect the browser `window.location.href`.

3. **`src/app/apply/success/page.tsx` [NEW]**
   - Create a dedicated success page confirming the payment.
   - Move the `CalendlyEmbed` component here so the user can book their session.

4. **Dependencies [NEW]**
   - Install `stripe` package (`npm install stripe`).

---
*Ready to begin execution once the Stripe variables are configured and the plan is approved!*
