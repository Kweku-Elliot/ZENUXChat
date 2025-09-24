// Lightweight offline AI simulation for transaction validation
// In production, this would run a quantized model like TensorFlow.js or ONNX.js

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  reason: string;
  suggestions?: string[];
}

interface TransactionData {
  amount: number;
  currency: string;
  fromUserId?: string;
  toUserId?: string;
  paymentMethod?: string;
  type: string;
  userBalance?: number;
  previousTransactions?: any[];
}

export class OfflineAI {
  private static instance: OfflineAI;
  
  static getInstance(): OfflineAI {
    if (!OfflineAI.instance) {
      OfflineAI.instance = new OfflineAI();
    }
    return OfflineAI.instance;
  }

  // Simulate AI-powered transaction validation
  async validateTransaction(data: TransactionData): Promise<ValidationResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const validationChecks = [];

    // Basic validation checks
    if (data.amount <= 0) {
      return {
        isValid: false,
        confidence: 0.95,
        reason: 'Invalid amount: must be greater than zero',
      };
    }

    if (data.amount > 50000) {
      return {
        isValid: false,
        confidence: 0.90,
        reason: 'Amount exceeds daily limit',
        suggestions: ['Split into smaller transactions', 'Contact support for higher limits'],
      };
    }

    // Balance check
    if (data.userBalance !== undefined && data.amount > data.userBalance) {
      return {
        isValid: false,
        confidence: 0.98,
        reason: 'Insufficient balance',
        suggestions: ['Add funds to your account', 'Reduce transaction amount'],
      };
    }

    // Fraud detection simulation
    const fraudScore = this.calculateFraudScore(data);
    if (fraudScore > 0.7) {
      return {
        isValid: false,
        confidence: 0.85,
        reason: 'Transaction flagged for potential fraud',
        suggestions: ['Verify recipient details', 'Contact support if legitimate'],
      };
    }

    // Rate limiting check
    if (this.checkRateLimit(data)) {
      return {
        isValid: false,
        confidence: 0.92,
        reason: 'Too many transactions in short period',
        suggestions: ['Wait before next transaction', 'Contact support for business account'],
      };
    }

    // All checks passed
    return {
      isValid: true,
      confidence: 0.95 - fraudScore * 0.2,
      reason: 'Transaction validated successfully',
    };
  }

  // Generate AI confirmation prompt
  async generateConfirmationPrompt(data: TransactionData): Promise<string> {
    const templates = [
      `Confirm sending ${data.currency} ${data.amount.toFixed(2)} via ${data.paymentMethod || 'mobile money'}?`,
      `You're about to transfer ${data.currency} ${data.amount.toFixed(2)}. Proceed with transaction?`,
      `Please confirm ${data.currency} ${data.amount.toFixed(2)} payment using ${data.paymentMethod || 'selected method'}.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Validate chat message content
  async validateMessage(content: string): Promise<{ safe: boolean; reason?: string }> {
    // Simulate content safety check
    await new Promise(resolve => setTimeout(resolve, 200));

    const flaggedWords = ['spam', 'scam', 'fraud', 'hack'];
    const lowercaseContent = content.toLowerCase();

    for (const word of flaggedWords) {
      if (lowercaseContent.includes(word)) {
        return {
          safe: false,
          reason: `Message contains potentially unsafe content: "${word}"`,
        };
      }
    }

    return { safe: true };
  }

  // Generate smart replies based on message context
  async generateSmartReplies(message: string): Promise<string[]> {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('transaction') || lowerMessage.includes('payment')) {
      return [
        'Need help with payments?',
        'Check transaction status',
        'View payment methods',
      ];
    }

    if (lowerMessage.includes('error') || lowerMessage.includes('problem')) {
      return [
        'What specific error occurred?',
        'Can you share more details?',
        'Let me help troubleshoot',
      ];
    }

    if (lowerMessage.includes('balance') || lowerMessage.includes('wallet')) {
      return [
        'Check current balance',
        'View transaction history',
        'Add funds to wallet',
      ];
    }

    return [
      'Tell me more',
      'How can I help?',
      'What would you like to know?',
    ];
  }

  private calculateFraudScore(data: TransactionData): number {
    let score = 0;

    // High amount increases fraud score
    if (data.amount > 1000) score += 0.2;
    if (data.amount > 5000) score += 0.3;

    // Unusual payment methods
    if (data.paymentMethod === 'unknown') score += 0.4;

    // Weekend/night transactions (higher risk)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) score += 0.1;

    // Random factor to simulate ML model uncertainty
    score += Math.random() * 0.2;

    return Math.min(score, 1);
  }

  private checkRateLimit(data: TransactionData): boolean {
    // Simulate rate limiting check
    // In real implementation, this would check recent transaction history
    return Math.random() < 0.05; // 5% chance of rate limit trigger
  }
}

export const offlineAI = OfflineAI.getInstance();
