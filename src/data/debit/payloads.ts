export type DebitScenario = 'success' | 'insufficient_funds'

export interface StepPayload {
  title: string
  object: string
  description: string
  data: Record<string, unknown>
}

const SUCCESS_PAYLOADS: StepPayload[] = [
  {
    title: 'Tokenization — PaymentMethod Created',
    object: 'payment_method',
    description: "Stripe.js intercepts the raw PAN and PIN block in the browser and encrypts both immediately. The card number is stored in Stripe's PCI-compliant vault; the PIN block travels separately via end-to-end encryption to the bank's HSM. Only a secure PaymentMethod token (pm_xxx) is transmitted to your server.",
    data: {
      id: 'pm_1OxK2LBLpOGa8XCy0DEBIT0',
      object: 'payment_method',
      type: 'card',
      vault_stored: true,
      pan_transmitted: false,
      pin_block_encrypted: true,
      token_type: 'payment_method',
      card: {
        brand: 'visa',
        last4: '5556',
        exp_month: 8,
        exp_year: 2026,
        funding: 'debit',
        country: 'US',
        fingerprint: 'abc123DEBITxEXAMPLE',
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
    description: "Your server creates a PaymentIntent for the debit transaction. Stripe recognizes the debit funding source and prepares to route through the PIN debit network instead of standard credit rails.",
    data: {
      id: 'pi_3OxK2LBLpOGa8XCy0DEBIT1',
      object: 'payment_intent',
      amount: 4900,
      currency: 'usd',
      status: 'requires_payment_method',
      payment_method: 'pm_1OxK2LBLpOGa8XCy0DEBIT0',
      payment_method_types: ['card'],
      capture_method: 'automatic',
      payment_method_options: { card: { network: 'debit' } },
      created: 1710000001,
      livemode: false,
    },
  },
  {
    title: 'Payment Processing',
    object: 'charge',
    description: "Stripe's API creates a pending Charge. The debit funding source is identified and the transaction is queued for routing through the Star / Interac PIN debit network.",
    data: {
      id: 'ch_3OxK2LBLpOGa8XCy0DEBIT2',
      object: 'charge',
      amount: 4900,
      currency: 'usd',
      status: 'pending',
      payment_intent: 'pi_3OxK2LBLpOGa8XCy0DEBIT1',
      payment_method: 'pm_1OxK2LBLpOGa8XCy0DEBIT0',
      payment_method_details: {
        type: 'card',
        card: { brand: 'visa', last4: '5556', network: 'star', funding: 'debit' },
      },
      created: 1710000002,
    },
  },
  {
    title: 'Radar Risk Assessment',
    object: 'radar.early_fraud_warning',
    description: "Stripe Radar evaluates the debit transaction. Debit transactions with PIN verification generally carry lower fraud risk — a score of 8/100 clears all block rules with no issues.",
    data: {
      id: 'issfr_1OxK2LDEBITEXAMPLE',
      object: 'radar.early_fraud_warning',
      charge: 'ch_3OxK2LBLpOGa8XCy0DEBIT2',
      risk_level: 'normal',
      risk_score: 8,
      rules_triggered: [],
      outcome: {
        type: 'authorized',
        network_status: 'approved_by_network',
        reason: 'low_risk',
        seller_message: 'Payment cleared Radar.',
      },
    },
  },
  {
    title: 'Debit Network Routing',
    object: 'issuing.authorization',
    description: "Stripe routes the transaction through the Star PIN debit network — not Visa/Mastercard credit rails. The network prepares an authorization request in the debit ISO 8583 format.",
    data: {
      network: 'star',
      routing_type: 'pin_debit',
      request_id: 'AUTH-1OxK2L-STAR-DEBIT',
      amount: 4900,
      currency: 'usd',
      card: { brand: 'visa', last4: '5556', funding: 'debit' },
      merchant: { name: 'Acme Corp', category: 'software' },
      status: 'pending',
      created: 1710000003,
    },
  },
  {
    title: 'PIN Verification',
    object: 'payment_method.updated',
    description: "The issuing bank's HSM (Hardware Security Module) decrypts and validates the encrypted PIN block. A successful match confirms the cardholder is physically present with the card.",
    data: {
      id: 'pm_1OxK2LBLpOGa8XCy0DEBIT0',
      object: 'payment_method',
      pin_verification: {
        status: 'success',
        method: 'encrypted_pin_block',
        attempts: 1,
        response_code: '00',
      },
      updated: 1710000004,
    },
  },
  {
    title: 'Balance Verified',
    object: 'charge',
    description: "The bank queries the cardholder's checking account in real time. With $523.40 available and only $49.00 requested, funds are confirmed sufficient and a hold is placed immediately.",
    data: {
      account_type: 'checking',
      available_balance: 52340,
      requested_amount: 4900,
      hold_amount: 4900,
      sufficient_funds: true,
      response_code: '00',
      timestamp: 1710000005,
    },
  },
  {
    title: 'Immediate Debit — Funds Transferred',
    object: 'charge',
    description: "Unlike credit cards, debit has no separate Capture phase. Authorization and fund transfer happen in a single atomic step: the bank immediately reduces the cardholder's available balance. There is no authorize-then-capture window.",
    data: {
      id: 'ch_3OxK2LBLpOGa8XCy0DEBIT2',
      object: 'charge',
      status: 'succeeded',
      amount: 4900,
      amount_captured: 4900,
      capture_method: 'immediate',
      authorize_then_capture: false,
      paid: true,
      debit_type: 'online_pin_debit',
      outcome: {
        network_status: 'approved_by_network',
        reason: null,
        risk_level: 'normal',
        seller_message: 'Payment complete.',
        type: 'authorized',
        authorization_code: '789012',
      },
    },
  },
  {
    title: 'ACH Settlement',
    object: 'payout',
    description: "Debit funds settle via same-day ACH, arriving in your merchant account by end of business today — significantly faster than the T+2 timeline for standard credit card payouts.",
    data: {
      id: 'po_1OxK2LBLpOGa8XCy0DEBIT8',
      object: 'payout',
      amount: 4761,
      currency: 'usd',
      status: 'pending',
      type: 'bank_account',
      method: 'same_day_ach',
      arrival_date: 1710028800,
      description: 'STRIPE PAYOUT - SAME DAY',
      destination: 'ba_1OxK2LEXAMPLE',
      fee: 139,
      created: 1710000006,
    },
  },
]

const INSUFFICIENT_FUNDS_PAYLOADS: StepPayload[] = [
  ...SUCCESS_PAYLOADS.slice(0, 6),
  {
    title: 'Insufficient Funds',
    object: 'charge',
    description: "The bank queries the checking account and finds insufficient funds. With only $22.10 available but $49.00 requested, the debit is declined with response code 51.",
    data: {
      account_type: 'checking',
      available_balance: 2210,
      requested_amount: 4900,
      sufficient_funds: false,
      response_code: '51',
      failure_code: 'insufficient_funds',
      failure_message: 'Your card has insufficient funds.',
      outcome: {
        network_status: 'declined_by_network',
        reason: 'insufficient_funds',
        type: 'issuer_declined',
        decline_code: '51',
      },
    },
  },
]

export function getPayload(stepIndex: number, scenario: DebitScenario): StepPayload | null {
  const map: Record<DebitScenario, StepPayload[]> = {
    success: SUCCESS_PAYLOADS,
    insufficient_funds: INSUFFICIENT_FUNDS_PAYLOADS,
  }
  return map[scenario][stepIndex] ?? null
}
