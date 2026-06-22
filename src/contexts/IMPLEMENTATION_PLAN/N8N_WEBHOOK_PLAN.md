# n8n Webhook Integration Plan

## Goal Description
Capture the lead data submitted during the Multi-Step Onboarding Modal, add a mandatory GDPR compliance checkbox, and push this data securely to an n8n webhook. To bypass browser CORS policies and keep the webhook URL secure, we will route the payload through a Next.js API Route (Vercel Serverless Function).

## Proposed Changes

### 1. `src/components/booking/BookingOnboardingModal.tsx` [MODIFY]
- **Form State:** Add a new `gdprConsent` boolean to the `formData` state.
- **UI Update (Step 5):** Add a required checkbox below the email input for GDPR compliance (e.g., "I consent to my data being processed and agree to the privacy policy.").
- **Validation:** Disable the submission button until First Name, Last Name, Email, and the GDPR checkbox are all valid/checked.
- **Submission Logic:** When the user clicks the CTA button on Step 5, instead of instantly transitioning to Step 6 (Calendly), we will trigger an asynchronous `fetch` call to our new internal API route (`/api/webhooks/n8n`), passing the full `formData`.
  - Display a loading spinner during the request.
  - On success, seamlessly transition to Step 6.

### 2. `src/app/api/webhooks/n8n/route.ts` [NEW]
- Create a Next.js App Router API handler (`POST`).
- **Purpose:** Serve as a proxy to forward data to n8n securely from the backend environment.
- **Implementation:**
  - Extract the JSON payload from the incoming request.
  - Retrieve the webhook URL from `process.env.N8N_WEBHOOK_URL`.
  - Make a `fetch` POST request to the n8n webhook.
  - Return a standard `200 OK` response back to the client.

### 3. Environment Variables
- Ensure `N8N_WEBHOOK_URL` is added to the `.env` configuration.

## Open Questions

> [!IMPORTANT]
> 1. **Button Copy & Flow:** You mentioned "when the user clicks on the button to get the roadmap". Should we rename the CTA button on Step 5 from "Pick a Time" to "Get the Roadmap"? 
> 2. **Post-Submission:** After the webhook fires successfully, do you still want to show the Calendly widget (Step 6), or should we just show a "Thank You / Success" screen?
> 3. **Payload Details:** Currently, the form collects Goal, Experience, Commitment, Limitations, Name, and Email. I assume we should send *all* of this data to n8n, correct?

## Verification Plan
### Automated Tests
- Build the Next.js project to ensure no TS errors exist.
### Manual Verification
- Test the GDPR checkbox validation.
- Monitor the network tab to ensure the internal API route is called successfully.
- Verify the serverless function securely relays the payload to a dummy/real webhook URL without throwing CORS errors.
