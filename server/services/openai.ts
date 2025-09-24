import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface ChatResponse {
  content: string;
  metadata?: any;
}

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  reason: string;
  suggestions?: string[];
}

interface FileAnalysisResult {
  analysis: string;
  metadata?: any;
}

interface TranscriptionResult {
  text: string;
  duration?: number;
}

class OpenAIService {
  
  async generateChatResponse(message: string): Promise<ChatResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          {
            role: "system",
            content: "You are Zenux AI, an intelligent assistant that helps users with various tasks including mobile money transactions, offline AI validation, and general questions. Be helpful, accurate, and concise in your responses."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_completion_tokens: 2048,
      });

      return {
        content: response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.",
        metadata: {
          model: "gpt-5",
          tokens: response.usage?.total_tokens || 0,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error("OpenAI chat error:", error);
      throw new Error("Failed to generate AI response: " + error.message);
    }
  }

  async generateImage(prompt: string): Promise<{ url: string }> {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      return { url: response.data[0].url! };
    } catch (error: any) {
      console.error("OpenAI image generation error:", error);
      throw new Error("Failed to generate image: " + error.message);
    }
  }

  async analyzeFile(file: Express.Multer.File, prompt?: string): Promise<FileAnalysisResult> {
    try {
      const fileContent = file.buffer.toString('base64');
      const analysisPrompt = prompt || "Analyze this file and provide a detailed summary of its contents.";

      let response;

      // Check if it's an image file
      if (file.mimetype.startsWith('image/')) {
        response = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: analysisPrompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${file.mimetype};base64,${fileContent}`
                  }
                }
              ],
            },
          ],
          max_completion_tokens: 2048,
        });
      } else {
        // For other file types, analyze text content if possible
        const textContent = file.buffer.toString('utf-8');
        response = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [
            {
              role: "system",
              content: "You are a file analysis expert. Analyze the provided file content and provide insights."
            },
            {
              role: "user",
              content: `${analysisPrompt}\n\nFile name: ${file.originalname}\nFile type: ${file.mimetype}\nFile content:\n${textContent.slice(0, 10000)}`
            }
          ],
          max_completion_tokens: 2048,
        });
      }

      return {
        analysis: response.choices[0].message.content || "Could not analyze the file.",
        metadata: {
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error("OpenAI file analysis error:", error);
      throw new Error("Failed to analyze file: " + error.message);
    }
  }

  async transcribeAudio(audioFile: Express.Multer.File): Promise<TranscriptionResult> {
    try {
      // Convert buffer to file-like object for OpenAI API
      const file = new File([audioFile.buffer], audioFile.originalname, { type: audioFile.mimetype });
      
      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
      });

      return {
        text: transcription.text,
        duration: transcription.duration || 0,
      };
    } catch (error: any) {
      console.error("OpenAI transcription error:", error);
      throw new Error("Failed to transcribe audio: " + error.message);
    }
  }

  async validateTransaction(transactionData: any): Promise<ValidationResult> {
    try {
      const prompt = `Analyze this transaction for potential issues and validate its legitimacy:
      
      Amount: ${transactionData.amount} ${transactionData.currency}
      Type: ${transactionData.type}
      Payment Method: ${transactionData.paymentMethod}
      User Balance: ${transactionData.userBalance || 'Unknown'}
      
      Please respond in JSON format with validation results.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a financial transaction validator. Analyze transactions for fraud, validity, and compliance. Respond with JSON containing isValid (boolean), confidence (0-1), reason (string), and optional suggestions array."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        isValid: result.isValid || false,
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        reason: result.reason || "Transaction validation completed",
        suggestions: result.suggestions || []
      };
    } catch (error: any) {
      console.error("OpenAI transaction validation error:", error);
      
      // Fallback validation logic
      const basicValidation = this.basicTransactionValidation(transactionData);
      return basicValidation;
    }
  }

  private basicTransactionValidation(data: any): ValidationResult {
    if (!data.amount || data.amount <= 0) {
      return {
        isValid: false,
        confidence: 0.95,
        reason: "Invalid amount: must be greater than zero"
      };
    }

    if (data.amount > 50000) {
      return {
        isValid: false,
        confidence: 0.90,
        reason: "Amount exceeds daily limit",
        suggestions: ["Split into smaller transactions", "Contact support for higher limits"]
      };
    }

    if (data.userBalance !== undefined && data.amount > data.userBalance) {
      return {
        isValid: false,
        confidence: 0.98,
        reason: "Insufficient balance",
        suggestions: ["Add funds to your account", "Reduce transaction amount"]
      };
    }

    return {
      isValid: true,
      confidence: 0.85,
      reason: "Transaction appears valid"
    };
  }

  async generateConfirmationPrompt(transactionData: any): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "Generate a clear, concise confirmation prompt for a financial transaction. Be professional and include key details."
          },
          {
            role: "user",
            content: `Generate a confirmation prompt for this transaction:
            Amount: ${transactionData.amount} ${transactionData.currency}
            Payment Method: ${transactionData.paymentMethod || 'mobile money'}
            Recipient: ${transactionData.recipient || 'selected recipient'}`
          }
        ],
      });

      return response.choices[0].message.content || `Confirm sending ${transactionData.currency} ${transactionData.amount} via ${transactionData.paymentMethod || 'mobile money'}?`;
    } catch (error: any) {
      console.error("OpenAI confirmation prompt error:", error);
      
      // Fallback confirmation prompt
      return `Confirm sending ${transactionData.currency} ${transactionData.amount.toFixed(2)} via ${transactionData.paymentMethod || 'mobile money'}?`;
    }
  }

  async generateSmartReplies(message: string): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "Generate 3 helpful, contextually relevant smart reply suggestions for the user's message. Keep them concise and actionable. Respond in JSON format with a 'replies' array."
          },
          {
            role: "user",
            content: `Generate smart replies for this message: "${message}"`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"replies": []}');
      return result.replies || ["Tell me more", "How can I help?", "What would you like to know?"];
    } catch (error: any) {
      console.error("OpenAI smart replies error:", error);
      
      // Fallback smart replies based on message content
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
  }
}

export const openAIService = new OpenAIService();
