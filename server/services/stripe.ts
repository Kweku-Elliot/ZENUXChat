import Stripe from "stripe";
import { storage } from "../storage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

class StripeService {
  
  async createPaymentIntent(amount: number, currency: string = "usd"): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      throw new Error("Failed to create payment intent: " + error.message);
    }
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });

      return customer;
    } catch (error: any) {
      console.error("Stripe customer creation error:", error);
      throw new Error("Failed to create customer: " + error.message);
    }
  }

  async createSubscription(userId: string, priceId: string): Promise<Stripe.Subscription> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      let customerId = user.stripeCustomerId;

      // Create customer if doesn't exist
      if (!customerId) {
        const customer = await this.createCustomer(user.email, user.displayName || user.username);
        customerId = customer.id;
        
        // Update user with stripe customer ID
        await storage.updateUser(userId, { stripeCustomerId: customerId });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId || process.env.STRIPE_PRICE_ID || "price_default",
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with subscription ID
      await storage.updateUser(userId, { 
        stripeSubscriptionId: subscription.id 
      });

      return subscription;
    } catch (error: any) {
      console.error("Stripe subscription error:", error);
      throw new Error("Failed to create subscription: " + error.message);
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice.payment_intent']
      });

      return subscription;
    } catch (error: any) {
      console.error("Stripe get subscription error:", error);
      throw new Error("Failed to retrieve subscription: " + error.message);
    }
  }

  async updateSubscription(subscriptionId: string, updates: Stripe.SubscriptionUpdateParams): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, updates);
      return subscription;
    } catch (error: any) {
      console.error("Stripe update subscription error:", error);
      throw new Error("Failed to update subscription: " + error.message);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      return subscription;
    } catch (error: any) {
      console.error("Stripe cancel subscription error:", error);
      throw new Error("Failed to cancel subscription: " + error.message);
    }
  }

  async createPrice(amount: number, currency: string = "usd", interval: "month" | "year" = "month"): Promise<Stripe.Price> {
    try {
      const price = await stripe.prices.create({
        unit_amount: Math.round(amount * 100),
        currency,
        recurring: {
          interval,
        },
        product_data: {
          name: `Zenux AI ${interval === "month" ? "Monthly" : "Yearly"} Plan`,
        },
      });

      return price;
    } catch (error: any) {
      console.error("Stripe create price error:", error);
      throw new Error("Failed to create price: " + error.message);
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error("Stripe webhook secret not configured");
      }

      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handlePaymentSuccess(paymentIntent);
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleSubscriptionPayment(invoice);
          break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionUpdate(subscription);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error: any) {
      console.error("Stripe webhook error:", error);
      throw new Error("Webhook processing failed: " + error.message);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Handle successful one-time payment
    console.log(`Payment succeeded: ${paymentIntent.id}`);
    
    // Here you could update user credits, unlock features, etc.
    // Based on payment metadata
  }

  private async handleSubscriptionPayment(invoice: Stripe.Invoice): Promise<void> {
    // Handle successful subscription payment
    console.log(`Subscription payment succeeded: ${invoice.id}`);
    
    if (invoice.customer && invoice.subscription) {
      // Update user's plan and reset usage counters
      const user = await this.getUserByStripeCustomerId(invoice.customer as string);
      if (user) {
        await storage.updateUser(user.id, {
          messagesUsed: 0,
          filesUploaded: 0,
          voiceMinutesUsed: 0,
          apiCallsUsed: 0,
        });
      }
    }
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    // Handle subscription updates (plan changes, cancellations, etc.)
    console.log(`Subscription updated: ${subscription.id}`);
    
    const user = await this.getUserByStripeCustomerId(subscription.customer as string);
    if (user) {
      const planMap: Record<string, string> = {
        'price_plus': 'plus',
        'price_pro': 'pro',
        'price_business': 'business',
      };

      const newPlan = subscription.items.data[0]?.price?.id 
        ? planMap[subscription.items.data[0].price.id] || 'free'
        : 'free';

      await storage.updateUser(user.id, { 
        plan: newPlan,
        stripeSubscriptionId: subscription.status === 'active' ? subscription.id : null
      });
    }
  }

  private async getUserByStripeCustomerId(customerId: string) {
    // This would need to be implemented in storage
    // For now, we'll return null
    return null;
  }

  // GHS to USD conversion (mock - in production, use real exchange rate API)
  convertGHSToUSD(amountGHS: number): number {
    const exchangeRate = 0.084; // 1 GHS = 0.084 USD (approximate)
    return Math.round(amountGHS * exchangeRate * 100) / 100;
  }

  // Create payment intent with GHS support
  async createGHSPaymentIntent(amountGHS: number): Promise<Stripe.PaymentIntent> {
    // Convert GHS to USD for Stripe processing
    const amountUSD = this.convertGHSToUSD(amountGHS);
    
    return this.createPaymentIntent(amountUSD, "usd");
  }
}

export const stripeService = new StripeService();
