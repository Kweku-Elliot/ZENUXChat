import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Glassmorphism, GradientCard } from '@/components/ui/glassmorphism';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Check, X, CreditCard, Smartphone, Phone, Signal } from 'lucide-react';

interface BillingProps {
  onBack: () => void;
}

export function Billing({ onBack }: BillingProps) {
  const { user } = useApp();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: '₵',
      period: '/month',
      features: [
        '50 messages/month',
        '2 file uploads',
        'Basic AI model',
        'Community support',
      ],
      limitations: [
        'No voice chat',
        'No API access',
      ],
      current: user?.plan.type === 'free',
    },
    {
      id: 'plus',
      name: 'Plus',
      price: 20,
      currency: '₵',
      period: '/month',
      features: [
        'Unlimited messages',
        '10 file uploads/month',
        'Voice chat (60 min/month)',
        'Advanced AI models',
        'Email support',
        'Priority queue',
      ],
      limitations: [],
      current: user?.plan.type === 'plus',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 50,
      currency: '₵',
      period: '/month',
      popular: true,
      features: [
        'Unlimited messages',
        '30 file uploads/month',
        'Voice chat (300 min/month)',
        'API access with limits',
        'Custom integrations',
        'Priority support',
      ],
      limitations: [],
      current: user?.plan.type === 'pro',
    },
    {
      id: 'business',
      name: 'Business',
      price: 100,
      currency: '₵',
      period: '/month',
      features: [
        'Unlimited everything',
        'Team collaboration',
        'White-label options',
        'Dedicated support',
        'Custom AI training',
        'Enterprise integrations',
        'Advanced analytics',
      ],
      limitations: [],
      current: user?.plan.type === 'business',
    },
  ];

  const paymentMethods = [
    { icon: Smartphone, name: 'MTN MoMo', color: 'text-yellow-600' },
    { icon: Phone, name: 'Vodafone Cash', color: 'text-red-500' },
    { icon: Signal, name: 'AirtelTigo', color: 'text-blue-500' },
    { icon: CreditCard, name: 'Cards', color: 'text-green-500' },
  ];

  const handleUpgrade = (planId: string) => {
    console.log(`Upgrading to ${planId} plan`);
    // TODO: Implement Stripe checkout
  };

  const messagesUsed = user?.plan.messagesUsed || 0;
  const messagesLimit = user?.plan.messagesLimit || 50;
  const filesUsed = user?.plan.filesUploaded || 0;
  const filesLimit = user?.plan.filesLimit || 2;

  const usagePercentage = (messagesUsed / messagesLimit) * 100;
  const filesPercentage = (filesUsed / filesLimit) * 100;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
          <p className="text-muted-foreground">
            Choose the perfect plan for your AI assistant needs
          </p>
        </div>

        {/* Current Usage */}
        <Glassmorphism className="p-6 rounded-2xl mb-8">
          <h3 className="text-lg font-semibold mb-4">Current Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Messages</span>
                <span>{messagesUsed}/{messagesLimit}</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>File Uploads</span>
                <span>{filesUsed}/{filesLimit}</span>
              </div>
              <Progress value={filesPercentage} className="h-2" />
            </div>
            {user?.plan.hasVoiceChat && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Voice Minutes</span>
                  <span>{user.plan.voiceMinutesUsed}/{user.plan.voiceMinutesLimit}</span>
                </div>
                <Progress 
                  value={(user.plan.voiceMinutesUsed / user.plan.voiceMinutesLimit) * 100} 
                  className="h-2" 
                />
              </div>
            )}
          </div>
        </Glassmorphism>

        {/* Pricing Plans */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative hover:shadow-lg transition-all ${
                plan.popular ? 'border-primary ring-2 ring-primary/20' : ''
              } ${plan.current ? 'bg-primary/5' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    Popular
                  </Badge>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-1 -right-1">
                  <Badge variant="outline" className="bg-primary text-primary-foreground">
                    Active
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg mb-2">{plan.name}</CardTitle>
                <div className="text-3xl font-bold mb-1">
                  {plan.currency}{plan.price}
                </div>
                <div className="text-sm text-muted-foreground">{plan.period}</div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    plan.current 
                      ? 'opacity-50 cursor-not-allowed' 
                      : plan.popular 
                        ? 'gradient-primary hover:opacity-90' 
                        : ''
                  }`}
                  variant={plan.current ? 'outline' : plan.popular ? 'default' : 'outline'}
                  disabled={plan.current}
                  onClick={() => handleUpgrade(plan.id)}
                  data-testid={`button-upgrade-${plan.id}`}
                >
                  {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Methods */}
        <Glassmorphism className="p-6 rounded-2xl mb-8">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {paymentMethods.map((method, index) => (
              <Card 
                key={index} 
                className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
                data-testid={`payment-method-${method.name.toLowerCase().replace(' ', '-')}`}
              >
                <method.icon className={`w-8 h-8 mx-auto mb-2 ${method.color}`} />
                <div className="text-sm font-medium">{method.name}</div>
              </Card>
            ))}
          </div>
        </Glassmorphism>

        {/* Billing Cycle */}
        <Glassmorphism className="p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Billing Cycle</h3>
          <RadioGroup 
            value={billingCycle} 
            onValueChange={setBillingCycle}
            className="space-y-3"
          >
            <div className="flex items-center justify-between p-3 border border-border rounded-xl">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="cursor-pointer">
                  <div className="font-medium">Monthly</div>
                  <div className="text-sm text-muted-foreground">Cancel anytime</div>
                </Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-border rounded-xl">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yearly" id="yearly" />
                <Label htmlFor="yearly" className="cursor-pointer">
                  <div className="font-medium">Yearly</div>
                  <div className="text-sm text-muted-foreground">
                    17% discount • Prorated changes
                  </div>
                </Label>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Save 17%
              </Badge>
            </div>
          </RadioGroup>
        </Glassmorphism>
      </div>
    </div>
  );
}
