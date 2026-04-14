import Stripe from "stripe";

const getStripeClient = () => {
  const secretKey = (process.env.STRIPE_SECRET_KEY || "").trim();

  if (!secretKey) {
    const error = new Error("STRIPE_SECRET_KEY is not configured");
    error.statusCode = 500;
    throw error;
  }

  return new Stripe(secretKey);
};

export const createCheckoutSession = async ({
  appointmentId,
  amount,
  currency,
}) => {
  const stripe = getStripeClient();
  const normalizedCurrency = String(currency || "LKR").toLowerCase();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: normalizedCurrency,
          product_data: {
            name: `Consultation Fee - Appointment ${appointmentId}`,
          },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.STRIPE_SUCCESS_URL || "http://localhost:5173/patient/payments/success"}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: process.env.STRIPE_CANCEL_URL || "http://localhost:5173/patient/payments/cancel",
    metadata: {
      appointmentId: String(appointmentId),
    },
  });

  return session;
};

export const retrieveCheckoutSession = async (sessionId) => {
  const stripe = getStripeClient();
  return await stripe.checkout.sessions.retrieve(sessionId);
};
