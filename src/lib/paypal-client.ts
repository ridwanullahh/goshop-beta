import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// This function sets up the PayPal environment.
// In a real production app, you would use `checkoutNodeJssdk.core.LiveEnvironment`.
const environment = new checkoutNodeJssdk.core.SandboxEnvironment(
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET
);

// This is the client that will be used to make all API calls.
const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

export default client;