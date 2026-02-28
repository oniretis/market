'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Package, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  ExternalLink
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface PaymentTransaction {
  id: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  reference: string;
  paystackReference: string;
  email: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  Product: {
    id: string;
    name: string;
    images: string[];
    User: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface PaymentHistoryProps {
  userId: string;
}

export default function PaymentHistory({ userId }: PaymentHistoryProps) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/payments/user/${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch payment history');
        }

        setTransactions(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4" />;
      case 'REFUNDED':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
            <p>No payment transactions found</p>
            <p className="text-sm">Your purchase history will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const successfulTransactions = transactions.filter(t => t.status === 'SUCCESS');
  const pendingTransactions = transactions.filter(t => t.status === 'PENDING');
  const failedTransactions = transactions.filter(t => t.status === 'FAILED');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold">{successfulTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{failedTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View and manage your payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
              <TabsTrigger value="successful">Successful ({successfulTransactions.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingTransactions.length})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({failedTransactions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <TransactionList transactions={transactions} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} />
            </TabsContent>

            <TabsContent value="successful" className="space-y-4">
              <TransactionList transactions={successfulTransactions} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} />
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <TransactionList transactions={pendingTransactions} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} />
            </TabsContent>

            <TabsContent value="failed" className="space-y-4">
              <TransactionList transactions={failedTransactions} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface TransactionListProps {
  transactions: PaymentTransaction[];
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

function TransactionList({ transactions, getStatusColor, getStatusIcon }: TransactionListProps) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={transaction.Product.images[0] || '/placeholder-product.jpg'}
                  alt={transaction.Product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">{transaction.Product.name}</h4>
                <p className="text-sm text-muted-foreground">
                  from {transaction.Product.User.firstName} {transaction.Product.User.lastName}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-lg">{formatCurrency(transaction.amount)}</p>
              <Badge className={getStatusColor(transaction.status)}>
                {getStatusIcon(transaction.status)}
                <span className="ml-1">{transaction.status}</span>
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              <p>Transaction ID: {transaction.id}</p>
              <p>Reference: {transaction.reference}</p>
              <p>Date: {new Date(transaction.createdAt).toLocaleDateString()}</p>
              {transaction.paidAt && (
                <p>Paid: {new Date(transaction.paidAt).toLocaleDateString()}</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              {transaction.status === 'SUCCESS' && (
                <>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Receipt
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/product/${transaction.Product.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Product
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
