export type CreditScenario = 'success' | 'declined' | 'fraud'

export interface StepPayload {
  title: string
  object: string
  description: string
  timing?: string
  data: Record<string, unknown>
}

const SUCCESS_PAYLOADS: StepPayload[] = [
  {
    title: 'Tokenization — PaymentMethod Created',
    object: 'payment_method',
    timing: '~100–200ms',
    description: "Stripe.js intercepts the raw PAN in the browser and immediately encrypts it. The card number is stored in Stripe's PCI-compliant vault and never transmitted to your server — only a secure PaymentMethod token (pm_xxx) travels onward.",
    data: {
      id: 'pm_1OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'payment_method',
      type: 'card',
      vault_stored: true,
      pan_transmitted: false,
      token_type: 'payment_method',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2027,
        funding: 'credit',
        country: 'US',
        fingerprint: 'zVZnv43N5Y7EXAMPLE',
      },
      billing_details: {
        name: 'Jane Doe',
        email: null,
        address: { country: 'US' },
      },
      created: 1710000000,
      livemode: false,
    },
  },
  {
    title: 'PaymentIntent Created',
    object: 'payment_intent',
    timing: '~200–500ms',
    description: "Your server creates a PaymentIntent representing the intent to collect a specific amount. Stripe validates the request and attaches the PaymentMethod, queuing it for processing.",
    data: {
      id: 'pi_3OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'payment_intent',
      amount: 4900,
      currency: 'usd',
      status: 'requires_payment_method',
      payment_method: 'pm_1OxK2LBLpOGa8XCy0EXAMPLE',
      payment_method_types: ['card'],
      capture_method: 'automatic',
      confirmation_method: 'automatic',
      description: 'Professional Plan — Monthly',
      created: 1710000001,
      livemode: false,
    },
  },
  {
    title: 'Payment Processing',
    object: 'charge',
    timing: '~200–500ms',
    description: "Stripe's API creates a pending Charge under the PaymentIntent and begins routing it through the internal processing pipeline toward the card network.",
    data: {
      id: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'charge',
      amount: 4900,
      currency: 'usd',
      status: 'pending',
      payment_intent: 'pi_3OxK2LBLpOGa8XCy0EXAMPLE',
      payment_method: 'pm_1OxK2LBLpOGa8XCy0EXAMPLE',
      payment_method_details: {
        type: 'card',
        card: { brand: 'visa', last4: '4242', network: 'visa' },
      },
      created: 1710000002,
    },
  },
  {
    title: 'Radar Risk Assessment',
    object: 'radar.early_fraud_warning',
    timing: '~100–300ms',
    description: "Stripe Radar's ML model evaluates the transaction against hundreds of signals. A risk score of 12/100 with no block rules triggered means the payment proceeds to network authorization.",
    data: {
      id: 'issfr_1OxK2LEXAMPLE',
      object: 'radar.early_fraud_warning',
      charge: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      risk_level: 'normal',
      risk_score: 12,
      rules_triggered: [],
      outcome: {
        type: 'authorized',
        network_status: 'approved_by_network',
        reason: 'low_risk',
        seller_message: 'Payment complete',
      },
    },
  },
  {
    title: 'Network Authorization Request',
    object: 'issuing.authorization',
    timing: '~500ms–2s',
    description: "Stripe sends an ISO 8583 authorization request to the Visa network, which routes it to the cardholder's issuing bank for an approve/decline decision.",
    data: {
      network: 'visa',
      request_id: 'AUTH-1OxK2L-VISA-EXAMPLE',
      amount: 4900,
      currency: 'usd',
      card: { brand: 'visa', last4: '4242' },
      merchant: { name: 'Acme Corp', category: 'software' },
      status: 'pending',
      created: 1710000003,
    },
  },
  {
    title: 'Bank Authorization',
    object: 'charge',
    timing: '~1–3s',
    description: "The issuing bank verifies the cardholder's available funds and card validity, returning an approval code. The charge status moves to 'succeeded' and funds are reserved.",
    data: {
      id: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'charge',
      status: 'succeeded',
      amount: 4900,
      amount_captured: 4900,
      paid: true,
      outcome: {
        network_status: 'approved_by_network',
        reason: null,
        risk_level: 'normal',
        seller_message: 'Payment complete.',
        type: 'authorized',
        authorization_code: '123456',
      },
    },
  },
  {
    title: 'Capture — Funds Acquired',
    object: 'payment_intent',
    timing: '~instant (automatic)',
    description: "Stripe executes the Capture phase: the previously authorized hold is converted into an actual charge. With capture_method: 'automatic', this happens immediately after authorization. The PaymentIntent status becomes 'succeeded' and a payment_intent.succeeded webhook fires to your backend.",
    data: {
      id: 'pi_3OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'payment_intent',
      status: 'succeeded',
      amount: 4900,
      amount_received: 4900,
      amount_captured: 4900,
      capture_method: 'automatic',
      currency: 'usd',
      latest_charge: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      created: 1710000004,
    },
  },
  {
    title: 'Payout Scheduled',
    object: 'payout',
    timing: '2–3 business days',
    description: "Stripe schedules a net payout of $46.24 (after $2.76 in processing fees) to your connected bank account. Standard payouts arrive in T+2 business days.",
    data: {
      id: 'po_1OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'payout',
      amount: 4624,
      currency: 'usd',
      status: 'pending',
      type: 'bank_account',
      arrival_date: 1710259200,
      description: 'STRIPE PAYOUT',
      destination: 'ba_1OxK2LEXAMPLE',
      fee: 276,
      method: 'standard',
      created: 1710000005,
    },
  },
]

const DECLINED_PAYLOADS: StepPayload[] = [
  ...SUCCESS_PAYLOADS.slice(0, 5),
  {
    title: 'Bank Declined',
    object: 'charge',
    timing: '~1–3s',
    description: "The issuing bank rejects the transaction with a generic decline (code 05). Common causes: insufficient funds, daily spend limits, or a bank-side fraud block.",
    data: {
      id: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'charge',
      status: 'failed',
      amount: 4900,
      paid: false,
      failure_code: 'card_declined',
      failure_message: 'Your card was declined.',
      outcome: {
        network_status: 'declined_by_network',
        reason: 'generic_decline',
        risk_level: 'normal',
        seller_message: 'The bank did not return any further details with this decline.',
        type: 'issuer_declined',
        decline_code: '05',
      },
    },
  },
  {
    title: 'Decline Response — Card Network',
    object: 'issuing.authorization',
    timing: '~200–500ms',
    description: "The Visa network receives the decline response from the issuing bank and routes it back toward Stripe. The decline code (05) travels through the same ISO 8583 channel that carried the original auth request.",
    data: {
      network: 'visa',
      request_id: 'AUTH-1OxK2L-VISA-EXAMPLE',
      status: 'declined',
      decline_code: '05',
      response_code: 'declined_by_network',
      original_request: {
        amount: 4900,
        currency: 'usd',
        card: { brand: 'visa', last4: '0002' },
      },
    },
  },
  {
    title: 'Decline Forwarded — Stripe API',
    object: 'payment_intent',
    timing: '~instant',
    description: "Stripe receives the network decline, updates the Charge and PaymentIntent, and fires a charge.failed webhook to your backend. The PaymentIntent status reverts to 'requires_payment_method', signaling that the customer must try again.",
    data: {
      id: 'pi_3OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'payment_intent',
      status: 'requires_payment_method',
      last_payment_error: {
        code: 'card_declined',
        decline_code: 'generic_decline',
        message: 'Your card was declined.',
        type: 'card_error',
        charge: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      },
    },
  },
  {
    title: 'Card Declined — Customer Notified',
    object: 'error',
    timing: '~instant',
    description: "Stripe.js surfaces the decline error to the browser via the confirmCardPayment() promise rejection. Your frontend receives a structured error object and can display a user-friendly message, prompting the customer to try a different card.",
    data: {
      type: 'card_error',
      code: 'card_declined',
      decline_code: 'generic_decline',
      message: 'Your card was declined.',
      payment_intent: {
        id: 'pi_3OxK2LBLpOGa8XCy0EXAMPLE',
        status: 'requires_payment_method',
      },
    },
  },
]

const FRAUD_PAYLOADS: StepPayload[] = [
  ...SUCCESS_PAYLOADS.slice(0, 3),
  {
    title: 'Radar Blocked',
    object: 'radar.early_fraud_warning',
    timing: '~100–300ms',
    description: "Radar's ML model scored this card at 94/100 risk and triggered two block rules. The payment is stopped here — no authorization request is sent to the card network.",
    data: {
      id: 'issfr_1OxK2LEXAMPLE',
      object: 'radar.early_fraud_warning',
      charge: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      risk_level: 'highest',
      risk_score: 94,
      rules_triggered: [
        { id: 'block_if_high_risk', description: 'Block if risk score > 75' },
        { id: 'block_stolen_card', description: 'Block if card reported stolen' },
      ],
      outcome: {
        type: 'blocked',
        network_status: 'not_sent_to_network',
        reason: 'highest_risk_level',
        seller_message: 'The payment was blocked by Stripe Radar.',
      },
    },
  },
  {
    title: 'Fraud Block Response — Stripe API',
    object: 'payment_intent',
    timing: '~instant',
    description: "Stripe's API receives Radar's block decision and updates the PaymentIntent. A radar.early_fraud_warning.created webhook fires. The PaymentIntent status reverts to 'requires_payment_method' — the card network was never contacted.",
    data: {
      id: 'pi_3OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'payment_intent',
      status: 'requires_payment_method',
      last_payment_error: {
        code: 'card_declined',
        decline_code: 'fraudulent',
        message: 'The payment was blocked by Stripe Radar.',
        type: 'card_error',
        blocked_by: 'stripe_radar',
      },
    },
  },
  {
    title: 'Payment Blocked — Customer Notified',
    object: 'error',
    timing: '~instant',
    description: "Stripe.js rejects the confirmCardPayment() promise with a fraud block error. The customer sees a generic decline message — Stripe deliberately avoids revealing that Radar flagged the card, to prevent fraudsters from iterating on detection signals.",
    data: {
      type: 'card_error',
      code: 'card_declined',
      decline_code: 'fraudulent',
      message: 'Your card was declined.',
      blocked_by: 'stripe_radar',
      payment_intent: {
        id: 'pi_3OxK2LBLpOGa8XCy0EXAMPLE',
        status: 'requires_payment_method',
      },
    },
  },
]

export function getPayload(stepIndex: number, scenario: CreditScenario): StepPayload | null {
  const map: Record<CreditScenario, StepPayload[]> = {
    success: SUCCESS_PAYLOADS,
    declined: DECLINED_PAYLOADS,
    fraud: FRAUD_PAYLOADS,
  }
  return map[scenario][stepIndex] ?? null
}
