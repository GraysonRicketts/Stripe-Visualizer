# [Stripe Payment Flow Visualizer](https://graysonricketts.github.io/stripe-visualizer/)

An interactive visualization of Stripe's payment processing flow, built with React, React Flow, and Tailwind CSS.

See it live at: https://graysonricketts.github.io/stripe-visualizer/

## Prerequisites

Node.js v20+ is required (v24 recommended). If you use nvm:

```sh
nvm use 24
```

## Getting Started

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```sh
npm run build
```

## Usage

1. Select a payment scenario from the left panel (Success, Declined, or Fraud)
2. Enter the corresponding test card number shown
3. Click **Pay** to animate the payment flow
4. Click any node to inspect the Stripe API payload for that step

## Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [@xyflow/react](https://reactflow.dev/) — flow graph
- [Framer Motion](https://motion.dev/) — animations
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) — state management
