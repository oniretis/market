'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import ProductImage from './ProductImage';

// Type definitions for better TypeScript safety
interface ProductUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  smallDescription: string;
  images: string[];
  isSold: boolean;
  User: ProductUser;
}

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface PaymentCheckoutProps {
  product: Product;
  user?: UserInfo;
}

// Error types for better error handling
type PaymentError = 'AUTH_REQUIRED' | 'PRODUCT_SOLD' | 'NETWORK_ERROR' | 'PAYMENT_FAILED' | 'INVALID_RESPONSE' | 'UNKNOWN';

interface PaymentErrorState {
  type: PaymentError;
  message: string;
  retryable: boolean;
}

export default function PaymentCheckout({ product, user }: PaymentCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PaymentErrorState | null>(null);
  const [paymentAttempts, setPaymentAttempts] = useState(0);

  // Maximum payment attempts to prevent abuse
  const MAX_PAYMENT_ATTEMPTS = 3;

  // Error mapping for better user experience
  const getErrorState = useCallback((errorType: PaymentError, customMessage?: string): PaymentErrorState => {
    const errorMap: Record<PaymentError, PaymentErrorState> = {
      'AUTH_REQUIRED': {
        type: 'AUTH_REQUIRED',
        message: 'Please sign in to continue with purchase',
        retryable: false
      },
      'PRODUCT_SOLD': {
        type: 'PRODUCT_SOLD',
        message: 'This product has already been sold',
        retryable: false
      },
      'NETWORK_ERROR': {
        type: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection and try again.',
        retryable: true
      },
      'PAYMENT_FAILED': {
        type: 'PAYMENT_FAILED',
        message: 'Payment initialization failed. Please try again.',
        retryable: true
      },
      'INVALID_RESPONSE': {
        type: 'INVALID_RESPONSE',
        message: 'Invalid response from payment server. Please try again.',
        retryable: true
      },
      'UNKNOWN': {
        type: 'UNKNOWN',
        message: customMessage || 'An unexpected error occurred. Please try again.',
        retryable: true
      }
    };

    return errorMap[errorType] || errorMap['UNKNOWN'];
  }, []);

  // Input validation
  const validatePaymentData = useCallback(() => {
    if (!user?.email || !user?.id) {
      setError(getErrorState('AUTH_REQUIRED'));
      return false;
    }

    if (!product?.id || !product?.price || product.price <= 0) {
      setError(getErrorState('INVALID_RESPONSE', 'Invalid product information'));
      return false;
    }

    if (product.isSold) {
      setError(getErrorState('PRODUCT_SOLD'));
      return false;
    }

    if (paymentAttempts >= MAX_PAYMENT_ATTEMPTS) {
      setError(getErrorState('UNKNOWN', 'Maximum payment attempts reached. Please refresh the page and try again.'));
      return false;
    }

    return true;
  }, [user, product, paymentAttempts, getErrorState]);

  const handlePayment = async () => {
    // Clear previous errors
    setError(null);

    console.log('Payment button clicked');
    console.log('Product:', product);
    console.log('User:', user);

    // Validate input
    if (!validatePaymentData()) {
      console.log('Validation failed');
      return;
    }

    console.log('Validation passed, starting payment...');
    setIsLoading(true);
    setPaymentAttempts(prev => prev + 1);

    try {
      // Create payment request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF protection
        },
        body: JSON.stringify({
          productId: product.id,
          email: user.email,
          amount: Math.round(product.price * 100), // Convert to kobo and ensure integer
          callback_url: `${window.location.origin}/payment/success?reference=REFERENCE`,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Payment API response status:', response.status);
      console.log('Payment API response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Payment API error response:', errorData);
        const errorMessage = errorData.error || 'Payment initialization failed';

        // Map HTTP status to error types
        if (response.status === 401) {
          setError(getErrorState('AUTH_REQUIRED'));
        } else if (response.status === 400) {
          setError(getErrorState('INVALID_RESPONSE', errorMessage));
        } else if (response.status >= 500) {
          setError(getErrorState('PAYMENT_FAILED'));
        } else {
          setError(getErrorState('UNKNOWN', errorMessage));
        }
        return;
      }

      const data = await response.json();

      console.log('Payment API success response:', data);

      // Validate response structure
      if (!data.data?.authorization_url) {
        console.log('Invalid payment response - missing authorization_url');
        setError(getErrorState('INVALID_RESPONSE', 'Invalid payment response from server'));
        return;
      }

      // Validate URL format
      try {
        const url = new URL(data.data.authorization_url);
        console.log('Payment URL validated:', url);
        if (!url.protocol.startsWith('https')) {
          throw new Error('Invalid payment URL protocol');
        }
      } catch {
        console.log('Invalid payment URL format');
        setError(getErrorState('INVALID_RESPONSE', 'Invalid payment URL'));
        return;
      }

      // Redirect to payment page
      console.log('Redirecting to:', data.data.authorization_url);
      window.location.href = data.data.authorization_url;

    } catch (err) {
      console.error('Payment error:', err);

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError(getErrorState('NETWORK_ERROR', 'Request timed out. Please try again.'));
        } else if (err.message.includes('fetch')) {
          setError(getErrorState('NETWORK_ERROR'));
        } else {
          setError(getErrorState('UNKNOWN', err.message));
        }
      } else {
        setError(getErrorState('UNKNOWN'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Retry payment function
  const handleRetry = () => {
    setError(null);
    handlePayment();
  };

  if (product.isSold) {
    return (
      <Card className="w-full max-w-md border-0 shadow-xl bg-white dark:bg-gray-800 overflow-hidden" role="alert" aria-live="polite">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-b border-red-100 dark:border-red-800">
          <CardTitle className="flex items-center gap-3 text-red-600">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6" />
            </div>
            Product Sold
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            This product has already been purchased
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This item is no longer available for purchase.
            </p>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong className="font-semibold">Tip:</strong> Browse similar products or contact sellers for alternatives.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-xl bg-white dark:bg-gray-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-gray-700">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          Complete Purchase
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Secure payment powered by Paystack
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Product Summary */}
        <section aria-label="Product summary">
          <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative shadow-inner">
            <ProductImage
              src={product.images[0] || ''}
              alt={product.name}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
              {product.smallDescription}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Price:</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(product.price)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Seller:</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {product.User.firstName} {product.User.lastName}
              </span>
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section aria-label="Payment method">
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all duration-200">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Paystack Secure Payment</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Card, Bank Transfer, USSD & more
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 text-xs font-medium px-3 py-1">
                Secure
              </Badge>
            </div>
          </div>
        </section>

        {/* User Info */}
        {user && (
          <section aria-label="User information">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Purchasing as:</p>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">{user.email}</p>
              </div>
            </div>
          </section>
        )}

        {/* Payment Button */}
        <div className="space-y-4">
          <Button
            onClick={error?.retryable ? handleRetry : handlePayment}
            disabled={isLoading || !user || product.isSold || paymentAttempts >= MAX_PAYMENT_ATTEMPTS}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] text-lg py-4"
            size="lg"
            aria-describedby={error ? 'error-message' : undefined}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-3 animate-spin" aria-hidden="true" />
                Processing...
              </>
            ) : error?.retryable ? (
              <>
                <CreditCard className="h-5 w-5 mr-3" aria-hidden="true" />
                Try Again
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-3" aria-hidden="true" />
                Pay {formatCurrency(product.price)}
              </>
            )}
          </Button>

          {paymentAttempts > 0 && (
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Payment attempts: <span className="font-semibold">{paymentAttempts}/{MAX_PAYMENT_ATTEMPTS}</span>
              </p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <footer className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Your payment information is encrypted and secure
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <p>Multiple payment options available</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <p>Instant confirmation after successful payment</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <p>24/7 customer support</p>
            </div>
          </div>
        </footer>
      </CardContent>
    </Card>
  );
}
