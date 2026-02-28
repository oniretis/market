import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Paystack } from 'paystack-sdk';

// Initialize Paystack with secret key
const paystackInstance = new Paystack(process.env.PAYSTACK_SECRET_KEY || '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }

    // Find transaction by reference
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { reference },
      include: {
        User: true,
        Product: {
          include: { User: true } // Include seller info
        }
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Verify payment with Paystack
    const paystackResponse = await paystackInstance.transaction.verify(reference);

    if (!paystackResponse.status) {
      return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
    }

    const paymentData = paystackResponse.data;

    // Update transaction based on verification
    let updatedTransaction;
    if (paymentData.status === 'success') {
      // Mark product as sold
      await prisma.product.update({
        where: { id: transaction.productId },
        data: { isSold: true }
      });

      // Update transaction as successful
      updatedTransaction = await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'SUCCESS',
          paidAt: new Date(),
          paymentMethod: paymentData.channel || 'card'
        }
      });

      // Log successful payment
      await prisma.activity.create({
        data: {
          userId: transaction.userId,
          action: 'PAYMENT_COMPLETED',
          description: `Payment completed for product: ${transaction.Product.name}`,
          metadata: {
            productId: transaction.productId,
            transactionId: transaction.id,
            amount: transaction.amount,
            reference: reference,
            paymentMethod: paymentData.channel
          }
        }
      });

      // Log seller activity
      await prisma.activity.create({
        data: {
          userId: transaction.Product.User.id,
          action: 'PRODUCT_SOLD',
          description: `Product sold: ${transaction.Product.name}`,
          metadata: {
            productId: transaction.productId,
            transactionId: transaction.id,
            amount: transaction.amount,
            buyerId: transaction.userId
          }
        }
      });

    } else {
      // Update transaction as failed
      updatedTransaction = await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' }
      });

      // Log failed payment
      await prisma.activity.create({
        data: {
          userId: transaction.userId,
          action: 'PAYMENT_FAILED',
          description: `Payment failed for product: ${transaction.Product.name}`,
          metadata: {
            productId: transaction.productId,
            transactionId: transaction.id,
            amount: transaction.amount,
            reference: reference,
            gatewayResponse: paymentData.gateway_response
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction: updatedTransaction,
        paymentData: paymentData,
        product: transaction.Product,
        buyer: transaction.User,
        seller: transaction.Product.User
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
