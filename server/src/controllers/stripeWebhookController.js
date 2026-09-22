import Stripe from "stripe";
import { supabase } from "../config/supabase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getDatabaseStatus(stripeStatus) {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";

    case "past_due":
      return "past_due";

    case "canceled":
      return "cancelled";

    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "inactive";

    default:
      return "inactive";
  }
}

function getRenewalDate(subscription) {
  const timestamp =
    subscription.current_period_end ??
    subscription.items?.data?.[0]?.current_period_end;

  if (!timestamp) {
    return null;
  }

  return new Date(timestamp * 1000)
    .toISOString()
    .split("T")[0];
}

async function saveSubscription(subscriptionData) {
  const userId =
    subscriptionData.metadata?.user_id;

  if (!userId) {
    console.error(
      "Stripe subscription is missing user_id metadata"
    );
    return;
  }

  const stripeStatus = subscriptionData.status;

  const databaseStatus =
    getDatabaseStatus(stripeStatus);

  const plan =
    subscriptionData.metadata?.plan ||
    "monthly";

  const amount =
    subscriptionData.items?.data?.[0]?.price?.unit_amount
      ? subscriptionData.items.data[0].price.unit_amount / 100
      : 0;

  const renewalDate =
    getRenewalDate(subscriptionData);

  const { error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan,
        status: databaseStatus,
        amount,
        currency: "INR",
        stripe_customer_id:
          subscriptionData.customer,
        stripe_subscription_id:
          subscriptionData.id,
        renewal_date: renewalDate,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    throw error;
  }
}

export async function stripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature error:",
      error.message
    );

    return res.status(400).send(
      `Webhook Error: ${error.message}`
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (
          session.mode !== "subscription" ||
          !session.subscription
        ) {
          break;
        }

        const subscription =
          await stripe.subscriptions.retrieve(
            session.subscription
          );

        await saveSubscription(subscription);

        await supabase
          .from("subscriptions")
          .update({
            stripe_checkout_session_id: session.id,
          })
          .eq("stripe_subscription_id", subscription.id);

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;

        await saveSubscription(subscription);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        await saveSubscription({
          ...subscription,
          status: "canceled",
        });

        break;
      }

      default:
        console.log(
          `Unhandled Stripe event: ${event.type}`
        );
    }

    return res.json({ received: true });
  } catch (error) {
    console.error(
      "Stripe webhook processing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
}