'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface PaymentData {
  transaction: {
    id: string;
    amount: number;
    status: string;
    paidAt: string;
    paymentMethod: string;
  };
  product: {
    id: string;
    name: string;
    images: string[];
    User: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  seller: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const reference = searchParams?.get('reference');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError('No payment reference found');
      setIsLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payment/verify?reference=${reference}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }

        setPaymentData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [reference]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Payment Verification Failed</CardTitle>
            <CardDescription>{error || 'Unable to verify your payment'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { transaction, product, buyer, seller } = paymentData;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your purchase has been completed successfully
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>Payment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transaction ID:</span>
                <span className="text-sm font-mono">{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reference:</span>
                <span className="text-sm font-mono">{reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount Paid:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <Badge variant="secondary">
                  {transaction.paymentMethod || 'Card'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className="bg-green-100 text-green-800">
                  {transaction.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Paid At:</span>
                <span className="text-sm">
                  {new Date(transaction.paidAt).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Item you purchased</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={product.images[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground">Product ID: {product.id}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Seller:</span>
                  <span className="text-sm font-medium">
                    {seller.firstName} {seller.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Seller Email:</span>
                  <span className="text-sm font-mono">{seller.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
            <CardDescription>Important information about your purchase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Download className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium mb-1">Download Receipt</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Get your payment receipt
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Download
                </Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <ExternalLink className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-medium mb-1">Contact Seller</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Arrange delivery/pickup
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact
                </Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-medium mb-1">Leave Review</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Share your experience
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button asChild className="flex-1">
            <Link href={`/product/${product.id}`}>
              View Product
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
