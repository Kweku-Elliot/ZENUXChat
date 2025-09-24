import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Glassmorphism, GradientCard } from '@/components/ui/glassmorphism';
import { useApp } from '@/contexts/AppContext';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { 
  ArrowLeft, 
  Plus, 
  Send, 
  Users, 
  ArrowDown, 
  ArrowUp, 
  Clock,
  Shield,
  Wallet
} from 'lucide-react';
import { TransactionRecord, WalletBalance } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface GroupWalletProps {
  onBack: () => void;
}

export function GroupWallet({ onBack }: GroupWalletProps) {
  const { wallets, setWallets, user, isOnline } = useApp();
  const { getTransactions, saveTransaction } = useOfflineStorage();
  const { toast } = useToast();
  
  const [selectedWallet, setSelectedWallet] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendRecipient, setSendRecipient] = useState('');

  // Mock wallet data - replace with actual data fetching
  useEffect(() => {
    if (wallets.length === 0) {
      const mockWallet: WalletBalance = {
        id: 'wallet-1',
        name: 'Team Project Fund',
        balance: 1250.00,
        currency: 'GHS',
        members: [
          {
            id: 'member-1',
            userId: 'user-1',
            username: 'John Doe',
            role: 'admin',
            contribution: 450.00,
            joinedAt: new Date().toISOString(),
          },
          {
            id: 'member-2',
            userId: 'user-2',
            username: 'Sarah Miller',
            role: 'member',
            contribution: 320.00,
            joinedAt: new Date().toISOString(),
          },
          {
            id: 'member-3',
            userId: 'user-3',
            username: 'Alex Brown',
            role: 'member',
            contribution: 280.00,
            joinedAt: new Date().toISOString(),
          },
          {
            id: 'member-4',
            userId: 'user-4',
            username: 'Emma Davis',
            role: 'member',
            contribution: 200.00,
            joinedAt: new Date().toISOString(),
          },
        ],
      };
      setWallets([mockWallet]);
      setSelectedWallet(mockWallet);
    } else {
      setSelectedWallet(wallets[0]);
    }
  }, [wallets, setWallets]);

  // Load transaction history
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const allTransactions = await getTransactions();
      // Filter transactions for group wallets
      const walletTransactions = allTransactions.filter(tx => tx.walletId);
      setTransactions(walletTransactions.slice(0, 10)); // Show recent 10
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleAddFunds = async () => {
    if (!selectedWallet || !addFundsAmount || !user) return;

    const amount = parseFloat(addFundsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to add",
        variant: "destructive",
      });
      return;
    }

    const transaction: TransactionRecord = {
      id: crypto.randomUUID(),
      fromUserId: user.id,
      walletId: selectedWallet.id,
      amount,
      currency: selectedWallet.currency,
      type: 'wallet_contribution',
      status: isOnline ? 'pending' : 'queued',
      paymentMethod: 'mtn_momo', // Default payment method
      aiValidated: false,
      offlineQueued: !isOnline,
      createdAt: new Date().toISOString(),
    };

    await saveTransaction(transaction);
    setTransactions(prev => [transaction, ...prev]);

    // Update wallet balance optimistically
    if (selectedWallet) {
      const updatedWallet = {
        ...selectedWallet,
        balance: selectedWallet.balance + amount,
      };
      setSelectedWallet(updatedWallet);
      setWallets(prev => prev.map(w => w.id === updatedWallet.id ? updatedWallet : w));
    }

    setAddFundsAmount('');
    setIsAddFundsOpen(false);
    
    toast({
      title: "Funds added successfully",
      description: `₵${amount.toFixed(2)} has been added to the wallet`,
    });
  };

  const handleSendMoney = async () => {
    if (!selectedWallet || !sendAmount || !sendRecipient || !user) return;

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to send",
        variant: "destructive",
      });
      return;
    }

    if (amount > selectedWallet.balance) {
      toast({
        title: "Insufficient funds",
        description: "Not enough balance in the wallet",
        variant: "destructive",
      });
      return;
    }

    const transaction: TransactionRecord = {
      id: crypto.randomUUID(),
      fromUserId: user.id,
      walletId: selectedWallet.id,
      amount: -amount, // Negative for outgoing
      currency: selectedWallet.currency,
      type: 'p2p',
      status: isOnline ? 'pending' : 'queued',
      paymentMethod: 'wallet_balance',
      aiValidated: false,
      offlineQueued: !isOnline,
      metadata: { recipient: sendRecipient },
      createdAt: new Date().toISOString(),
    };

    await saveTransaction(transaction);
    setTransactions(prev => [transaction, ...prev]);

    // Update wallet balance optimistically
    const updatedWallet = {
      ...selectedWallet,
      balance: selectedWallet.balance - amount,
    };
    setSelectedWallet(updatedWallet);
    setWallets(prev => prev.map(w => w.id === updatedWallet.id ? updatedWallet : w));

    setSendAmount('');
    setSendRecipient('');
    setIsSendMoneyOpen(false);
    
    toast({
      title: "Money sent successfully",
      description: `₵${amount.toFixed(2)} sent to ${sendRecipient}`,
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <ArrowDown className="w-4 h-4 text-green-500" />;
    }
    return <ArrowUp className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      case 'queued':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!selectedWallet) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Group Wallets</h3>
          <p className="text-muted-foreground">Create or join a group wallet to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold mb-2">Group Wallet</h1>
          <p className="text-muted-foreground">Manage shared funds with your group</p>
        </div>

        {/* Wallet Balance */}
        <GradientCard className="p-6 mb-6 text-center">
          <div className="text-sm text-muted-foreground mb-2">
            {selectedWallet.name}
          </div>
          <div className="text-4xl font-bold mb-4">
            ₵{selectedWallet.balance.toFixed(2)}
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>{selectedWallet.members.length} Contributors</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>AI Validated</span>
            </div>
          </div>
        </GradientCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
            <DialogTrigger asChild>
              <Button 
                className="p-6 h-auto glass-effect hover:bg-muted/50 transition-colors"
                variant="ghost"
                data-testid="button-add-funds"
              >
                <div className="text-center">
                  <Plus className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-sm font-medium">Add Funds</div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-add-funds">
              <DialogHeader>
                <DialogTitle>Add Funds to Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="add-amount">Amount (₵)</Label>
                  <Input
                    id="add-amount"
                    type="number"
                    placeholder="0.00"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    data-testid="input-add-amount"
                  />
                </div>
                <Button 
                  onClick={handleAddFunds}
                  className="w-full"
                  disabled={!addFundsAmount}
                  data-testid="button-confirm-add-funds"
                >
                  Add Funds
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSendMoneyOpen} onOpenChange={setIsSendMoneyOpen}>
            <DialogTrigger asChild>
              <Button 
                className="p-6 h-auto glass-effect hover:bg-muted/50 transition-colors"
                variant="ghost"
                data-testid="button-send-money"
              >
                <div className="text-center">
                  <Send className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-sm font-medium">Send Money</div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-send-money">
              <DialogHeader>
                <DialogTitle>Send Money</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="send-recipient">Recipient</Label>
                  <Input
                    id="send-recipient"
                    placeholder="Enter recipient name or ID"
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    data-testid="input-send-recipient"
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
                    data-testid="input-send-amount"
                  />
                </div>
                <Button 
                  onClick={handleSendMoney}
                  className="w-full"
                  disabled={!sendAmount || !sendRecipient}
                  data-testid="button-confirm-send-money"
                >
                  Send Money
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Contributors */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Contributors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedWallet.members.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-4 glass-effect rounded-xl"
                  data-testid={`contributor-${member.userId}`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.username.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.username}</div>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₵{member.contribution.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {((member.contribution / selectedWallet.balance) * 100).toFixed(0)}% share
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-4 glass-effect rounded-xl"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type, transaction.amount)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {transaction.type === 'wallet_contribution' 
                              ? 'Funds Added'
                              : transaction.metadata?.recipient 
                                ? `Sent to ${transaction.metadata.recipient}`
                                : 'Group Transaction'
                            }
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.paymentMethod} • {formatTime(transaction.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {transaction.amount > 0 ? '+' : ''}₵{Math.abs(transaction.amount).toFixed(2)}
                        </div>
                        <div className={`text-xs ${getStatusColor(transaction.status)} flex items-center space-x-1`}>
                          {transaction.aiValidated && <Shield className="w-3 h-3" />}
                          <span className="capitalize">{transaction.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GroupWallet;
