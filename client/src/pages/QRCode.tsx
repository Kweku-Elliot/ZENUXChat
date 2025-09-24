import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Glassmorphism } from '@/components/ui/glassmorphism';
import { useApp } from '@/contexts/AppContext';
import { useAI } from '@/hooks/useAI';
import { 
  ArrowLeft, 
  QrCode, 
  Camera, 
  Send, 
  Receipt, 
  Download,
  Share,
  Printer,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeProps {
  onBack: () => void;
}

interface PaymentData {
  amount: number;
  currency: string;
  recipient: string;
  reference: string;
  timestamp: string;
}

export function QRCode({ onBack }: QRCodeProps) {
  const { user, isOnline } = useApp();
  const { validateTransaction, generateConfirmationPrompt } = useAI();
  const { toast } = useToast();
  
  const [sendAmount, setSendAmount] = useState('');
  const [sendRecipient, setSendRecipient] = useState('');
  const [scanResult, setScanResult] = useState<PaymentData | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [confirmationPrompt, setConfirmationPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<PaymentData | null>(null);

  // Mock QR code generation (in production, use actual QR code library)
  const generateQRCode = () => {
    const data = {
      amount: parseFloat(sendAmount),
      currency: 'GHS',
      recipient: sendRecipient,
      reference: `QR-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    // Mock QR code as text for demonstration
    return `zenux://pay?amount=${data.amount}&currency=${data.currency}&recipient=${encodeURIComponent(data.recipient)}&ref=${data.reference}`;
  };

  const handleGenerateQR = () => {
    if (!sendAmount || !sendRecipient) {
      toast({
        title: "Missing information",
        description: "Please enter both amount and recipient",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const qrData = generateQRCode();
    console.log('Generated QR Code:', qrData);
    
    toast({
      title: "QR Code generated",
      description: "Share this QR code for payment",
    });
  };

  // Mock QR scanner result
  const simulateQRScan = () => {
    const mockData: PaymentData = {
      amount: 150.00,
      currency: 'GHS',
      recipient: 'Local Merchant',
      reference: `QR-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    setScanResult(mockData);
    handlePaymentConfirmation(mockData);
  };

  const handlePaymentConfirmation = async (paymentData: PaymentData) => {
    setIsProcessing(true);
    
    try {
      // Validate transaction with AI
      const validation = await validateTransaction({
        amount: paymentData.amount,
        currency: paymentData.currency,
        type: 'qr_payment',
        paymentMethod: 'qr_code',
        userBalance: 1000, // Mock balance
      });

      if (!validation.isValid) {
        toast({
          title: "Transaction validation failed",
          description: validation.reason,
          variant: "destructive",
        });
        return;
      }

      // Generate confirmation prompt
      const prompt = await generateConfirmationPrompt({
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: 'QR Code',
      });
      
      setConfirmationPrompt(prompt);
      setIsConfirmDialogOpen(true);
      
    } catch (error) {
      toast({
        title: "Validation error",
        description: "Failed to validate transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!scanResult) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLastTransaction(scanResult);
      setIsConfirmDialogOpen(false);
      setIsReceiptDialogOpen(true);
      setScanResult(null);
      
      toast({
        title: "Payment successful",
        description: `₵${scanResult.amount.toFixed(2)} sent successfully`,
      });
      
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReceiptAction = (action: 'download' | 'print' | 'share') => {
    toast({
      title: `Receipt ${action}`,
      description: `Receipt ${action} functionality would be implemented here`,
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold mb-2">QR Code Payments</h1>
          <p className="text-muted-foreground">Send and receive payments using QR codes</p>
        </div>

        {/* Status Indicator */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2">
              {isOnline ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-500 font-medium">Online - Ready for payments</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-amber-500 font-medium">Offline - Payments will be queued</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QR Code Tabs */}
        <Tabs defaultValue="send" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send" data-testid="tab-send">Send Money</TabsTrigger>
            <TabsTrigger value="receive" data-testid="tab-receive">Receive Money</TabsTrigger>
          </TabsList>

          {/* Send Money Tab */}
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Generate QR Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="send-recipient">Recipient</Label>
                  <Input
                    id="send-recipient"
                    placeholder="Enter recipient name"
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    data-testid="input-recipient"
                  />
                </div>
                
                <div>
                  <Label htmlFor="send-amount">Amount (₵)</Label>
                  <Input
                    id="send-amount"
                    type="number"
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    data-testid="input-amount"
                  />
                </div>

                <Button 
                  onClick={handleGenerateQR}
                  className="w-full gradient-primary"
                  disabled={!sendAmount || !sendRecipient}
                  data-testid="button-generate-qr"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>

                {/* Mock QR Code Display */}
                {sendAmount && sendRecipient && (
                  <Glassmorphism className="p-6 text-center">
                    <div className="w-48 h-48 mx-auto bg-white p-4 rounded-xl mb-4">
                      <div className="w-full h-full bg-black/10 rounded-lg flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      QR Code for ₵{parseFloat(sendAmount || '0').toFixed(2)} to {sendRecipient}
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </Glassmorphism>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receive Money Tab */}
          <TabsContent value="receive">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Scan QR Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Glassmorphism className="p-8 text-center">
                  <div className="w-64 h-64 mx-auto bg-muted/50 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                    <Camera className="w-16 h-16 text-muted-foreground" />
                    {/* Mock scanning overlay */}
                    <div className="absolute inset-0 border-2 border-primary/30 rounded-xl">
                      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary rounded-tl-lg" />
                      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary rounded-tr-lg" />
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary rounded-bl-lg" />
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary rounded-br-lg" />
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Position QR code within the frame
                  </p>
                  <Button 
                    onClick={simulateQRScan}
                    variant="outline"
                    data-testid="button-simulate-scan"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Simulate QR Scan
                  </Button>
                </Glassmorphism>

                {/* Recent Transactions */}
                <div className="space-y-3">
                  <h4 className="font-medium">Recent QR Payments</h4>
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No recent QR payments
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Confirmation Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent data-testid="dialog-payment-confirmation">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Confirm Payment</span>
              </DialogTitle>
            </DialogHeader>
            
            {scanResult && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-muted rounded-xl">
                  <div className="text-2xl font-bold mb-2">
                    ₵{scanResult.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    to {scanResult.recipient}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Reference:</span>
                    <span className="font-mono">{scanResult.reference}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payment Method:</span>
                    <span>QR Code</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>AI Validation:</span>
                    <Badge variant="outline" className="text-green-600">
                      <Shield className="w-3 h-3 mr-1" />
                      Validated
                    </Badge>
                  </div>
                </div>

                {confirmationPrompt && (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm">{confirmationPrompt}</p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsConfirmDialogOpen(false)}
                    data-testid="button-cancel-payment"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 gradient-primary"
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    data-testid="button-confirm-payment"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Payment'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Receipt Dialog */}
        <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
          <DialogContent data-testid="dialog-receipt">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-green-500" />
                <span>Payment Receipt</span>
              </DialogTitle>
            </DialogHeader>
            
            {lastTransaction && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-xl">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-700 dark:text-green-300 mb-1">
                    Payment Successful
                  </div>
                  <div className="text-2xl font-bold">
                    ₵{lastTransaction.amount.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Recipient:</span>
                    <span className="font-medium">{lastTransaction.recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reference:</span>
                    <span className="font-mono">{lastTransaction.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span>{new Date(lastTransaction.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>QR Code</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction Fee:</span>
                    <span>₵0.00</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total Amount:</span>
                    <span>₵{lastTransaction.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleReceiptAction('download')}
                    data-testid="button-download-receipt"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleReceiptAction('print')}
                    data-testid="button-print-receipt"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Printer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleReceiptAction('share')}
                    data-testid="button-share-receipt"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default QRCode;
