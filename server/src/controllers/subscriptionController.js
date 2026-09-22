import Stripe from "stripe";
import { supabase } from "../config/supabase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  monthly: {
    name: "Monthly Membership",
    amount: 49900,
    interval: "month",
  },
  yearly: {
    name: "Yearly Membership",
    amount: 499000,
    interval: "year",
  },
};

export async function getMySubscription(req, res) {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      subscription: data,
    });
  } catch (error) {
    console.error("Get subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch subscription",
    });
  }
}

export async function createCheckoutSession(req, res) {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    const { data: existingSubscription, error: subscriptionError } =
      await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", req.user.id)
        .maybeSingle();

    if (subscriptionError) {
      throw subscriptionError;
    }

    if (existingSubscription?.status === "active") {
      return res.status(409).json({
        success: false,
        message: "You already have an active subscription",
      });
    }

    const { data: userCharity, error: charityError } =
      await supabase
        .from("user_charities")
        .select(`
          charity_id,
          contribution_percentage,
          charities (
            id,
            name
          )
        `)
        .eq("user_id", req.user.id)
        .maybeSingle();

    if (charityError) {
      throw charityError;
    }

    if (!userCharity) {
      return res.status(400).json({
        success: false,
        message: "Please select a charity before subscribing",
      });
    }

    const selectedPlan = PLANS[plan];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      client_reference_id: req.user.id,

      customer_email: req.user.email,

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: selectedPlan.name,
              description:
                "Digital Heroes membership with golf rewards and charitable impact",
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: selectedPlan.interval,
            },
          },
          quantity: 1,
        },
      ],

      metadata: {
        user_id: req.user.id,
        plan,
        charity_id: userCharity.charity_id,
        charity_percentage: String(
          userCharity.contribution_percentage
        ),
      },

      subscription_data: {
        metadata: {
          user_id: req.user.id,
          plan,
          charity_id: userCharity.charity_id,
          charity_percentage: String(
            userCharity.contribution_percentage
          ),
        },
      },

      success_url:
        `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${process.env.CLIENT_URL}/subscription/cancel`,

      billing_address_collection: "auto",
    });

    return res.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create checkout session",
    });
  }
}

export async function cancelSubscription(req, res) {
  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!subscription?.stripe_subscription_id) {
      return res.status(404).json({
        success: false,
        message: "No active Stripe subscription found",
      });
    }

    const updatedSubscription =
      await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );

    return res.json({
      success: true,
      message:
        "Subscription scheduled for cancellation at the end of the billing period",
      cancelAtPeriodEnd:
        updatedSubscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel subscription",
    });
  }
}