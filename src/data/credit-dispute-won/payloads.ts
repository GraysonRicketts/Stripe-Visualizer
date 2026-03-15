export type DisputeScenario = 'won' | 'lost'

export interface StepPayload {
  title: string
  object: string
  description: string
  timing?: string
  data: Record<string, unknown>
}

const DISPUTE_WON_PAYLOADS: StepPayload[] = [
  // Step 0 — cardholder
  {
    title: 'Cardholder Files Dispute',
    object: 'dispute',
    description: "The cardholder contacts their issuing bank and claims the charge was unauthorized or that the goods/services weren't delivered as promised. This triggers the formal chargeback process — Stripe is not yet involved at this stage.",
    data: {
      reason: 'fraudulent',
      cardholder_statement: 'I did not authorize this transaction.',
      original_charge: {
        amount: 4900,
        currency: 'usd',
        date: '2024-03-01',
        merchant: 'Acme Corp',
      },
    },
  },
  // Step 1 — issuer-dispute
  {
    title: 'Issuing Bank Opens Chargeback',
    object: 'dispute',
    timing: '1–2 business days',
    description: "The issuing bank validates the cardholder's claim and formally opens a chargeback. The disputed funds ($49.00) are provisionally reversed from the merchant's account. The bank notifies the card network, which routes the dispute to Stripe.",
    data: {
      id: 'dp_1OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'dispute',
      amount: 4900,
      currency: 'usd',
      status: 'needs_response',
      reason: 'fraudulent',
      charge: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      balance_transactions: [
        {
          id: 'txn_1OxK2LEXAMPLE_debit',
          type: 'adjustment',
          amount: -4900,
          description: 'Chargeback debit',
        },
        {
          id: 'txn_1OxK2LEXAMPLE_fee',
          type: 'adjustment',
          amount: -1500,
          description: 'Dispute fee',
        },
      ],
      created: 1710086400,
    },
  },
  // Step 2 — card-network-dispute
  {
    title: 'Card Network Routes Dispute',
    object: 'dispute',
    timing: '~1 day',
    description: "The Visa network acts as a clearinghouse, routing the formal dispute notification from the issuing bank to Stripe (the acquirer). This triggers a webhook and debits the disputed amount plus a $15 dispute fee from the Stripe account.",
    data: {
      network: 'visa',
      dispute_id: 'dp_1OxK2LBLpOGa8XCy0EXAMPLE',
      case_number: 'VISA-2024-0315-EXAMPLE',
      reason_code: '10.4',
      reason_description: 'Fraudulent Transaction — Card Absent Environment',
      response_due_date: '2024-03-22',
      acquiring_reference: 'ACQ-1OxK2LEXAMPLE',
    },
  },
  // Step 3 — stripe-dispute
  {
    title: 'Stripe Notified — Dispute Created',
    object: 'dispute',
    timing: '~instant',
    description: "Stripe receives the dispute from the card network and fires a `charge.dispute.created` webhook to your server. The disputed funds ($49.00) plus a $15 dispute fee are immediately debited from your Stripe balance. You now have 7–21 days to submit evidence.",
    data: {
      id: 'dp_1OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'dispute',
      amount: 4900,
      currency: 'usd',
      charge: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      payment_intent: 'pi_3OxK2LBLpOGa8XCy0EXAMPLE',
      status: 'needs_response',
      reason: 'fraudulent',
      is_charge_refundable: false,
      evidence_details: {
        due_by: 1711324800,
        has_evidence: false,
        past_due: false,
        submission_count: 0,
      },
      fee: 1500,
      fee_refundable: false,
      network_reason_code: '10.4',
      created: 1710086400,
      livemode: false,
    },
  },
  // Step 4 — evidence-submitted
  {
    title: 'Evidence Submitted',
    object: 'dispute',
    timing: 'within 7–21 days',
    description: "The merchant uploads compelling evidence via the Stripe Dashboard or API — including shipping confirmation, delivery proof, customer communications, and a rebuttal letter. Stripe forwards this to the issuing bank via the card network.",
    data: {
      id: 'dp_1OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'dispute',
      status: 'under_review',
      evidence: {
        customer_name: 'Jane Doe',
        customer_email_address: 'jane@example.com',
        customer_ip_address: '192.168.1.100',
        shipping_carrier: 'UPS',
        shipping_tracking_number: '1Z9999W99999999999',
        shipping_date: '2024-03-02',
        delivery_address: '123 Main St, San Francisco, CA 94105',
        product_description: 'Professional Plan — Monthly Subscription',
        refund_policy: 'All sales final for digital subscriptions.',
        uncategorized_text: 'Customer authenticated via 3D Secure and completed purchase. Delivery confirmed.',
        service_date: '2024-03-01',
      },
      evidence_details: {
        due_by: 1711324800,
        has_evidence: true,
        past_due: false,
        submission_count: 1,
      },
    },
  },
  // Step 5 — network-evidence
  {
    title: 'Card Network Forwards Evidence',
    object: 'dispute',
    timing: '~1 day',
    description: "Stripe packages the evidence and transmits it to the Visa network, which routes it to the cardholder's issuing bank for review. The dispute status updates to `under_review` — the ball is now in the issuer's court.",
    data: {
      network: 'visa',
      dispute_id: 'dp_1OxK2LBLpOGa8XCy0EXAMPLE',
      case_number: 'VISA-2024-0315-EXAMPLE',
      evidence_transmitted: true,
      evidence_pages: 4,
      transmitted_at: 1711238400,
      review_expected_by: '2024-05-01',
    },
  },
  // Step 6 — issuer-review
  {
    title: 'Issuer Reviews Evidence',
    object: 'dispute',
    timing: '60–75 days',
    description: "The issuing bank's dispute team reviews the merchant's evidence against the cardholder's claim. This process typically takes 60–75 days. The dispute status remains `under_review` during this period.",
    data: {
      id: 'dp_1OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'dispute',
      status: 'under_review',
      reason: 'fraudulent',
      evidence_details: {
        has_evidence: true,
        submission_count: 1,
        past_due: false,
      },
      review_started: 1711238400,
      review_expected_complete: '2024-05-15',
    },
  },
  // Step 7 — dispute-won
  {
    title: 'Dispute Won — Funds Returned',
    object: 'dispute',
    timing: '~instant',
    description: "The issuing bank rules in the merchant's favor: the evidence was compelling enough to overturn the chargeback. Stripe fires a `charge.dispute.closed` webhook with `status: won`. The $49.00 is returned to the Stripe balance; the $15 dispute fee is non-refundable.",
    data: {
      id: 'dp_1OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'dispute',
      status: 'won',
      amount: 4900,
      currency: 'usd',
      charge: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      reason: 'fraudulent',
      balance_transactions: [
        {
          id: 'txn_1OxK2LEXAMPLE_reversal',
          type: 'adjustment',
          amount: 4900,
          description: 'Chargeback reversal — dispute won',
        },
      ],
      fee: 1500,
      fee_refundable: false,
      closed_at: 1715817600,
      livemode: false,
    },
  },
]

const DISPUTE_LOST_EXTRA: StepPayload[] = [
  // Step 7 — dispute-lost-stripe
  {
    title: 'Dispute Lost',
    object: 'dispute',
    timing: '~instant',
    description: "The issuing bank rules in the cardholder's favor. The evidence was insufficient to overcome the chargeback claim. Stripe fires a `charge.dispute.closed` webhook with `status: lost`. The $49.00 remains debited from the merchant's balance permanently.",
    data: {
      id: 'dp_1OxK2LBLpOGa8XCy0EXAMPLE',
      object: 'dispute',
      status: 'lost',
      amount: 4900,
      currency: 'usd',
      charge: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      reason: 'fraudulent',
      balance_transactions: [],
      fee: 1500,
      fee_refundable: false,
      outcome: {
        network_status: 'lost',
        reason: 'evidence_insufficient',
        seller_message: 'The dispute was decided in the cardholder\'s favor.',
      },
      closed_at: 1715817600,
      livemode: false,
    },
  },
  // Step 8 — funds-retained
  {
    title: 'Cardholder Wins — Funds Returned',
    object: 'balance_transaction',
    timing: '~1–2 days',
    description: "The provisional credit to the cardholder becomes permanent. The $49.00 is fully returned to the cardholder's account. This decision is final — neither the merchant nor Stripe can appeal further under standard card network rules.",
    data: {
      issuer_decision: 'cardholder_prevails',
      funds_returned_to_cardholder: true,
      amount: 4900,
      currency: 'usd',
      dispute_final: true,
      appeal_available: false,
      merchant_impact: {
        funds_lost: 4900,
        dispute_fee_lost: 1500,
        total_loss: 6400,
        charge: 'ch_3OxK2LBLpOGa8XCy0EXAMPLE',
      },
    },
  },
]

const DISPUTE_LOST_PAYLOADS: StepPayload[] = [
  ...DISPUTE_WON_PAYLOADS.slice(0, 7),
  ...DISPUTE_LOST_EXTRA,
]

export function getPayload(stepIndex: number, scenario: DisputeScenario): StepPayload | null {
  const map: Record<DisputeScenario, StepPayload[]> = {
    won: DISPUTE_WON_PAYLOADS,
    lost: DISPUTE_LOST_PAYLOADS,
  }
  return map[scenario][stepIndex] ?? null
}
