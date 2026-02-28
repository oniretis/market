import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulCharge(event.data);
        break;
      
      case 'charge.failed':
        await handleFailedCharge(event.data);
        break;
      
      case 'transfer.success':
        await handleSuccessfulTransfer(event.data);
        break;
      
      case 'transfer.failed':
        await handleFailedTransfer(event.data);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulCharge(data: any) {
  try {
    const reference = data.reference;
    
    // Find transaction by reference
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { reference },
      include: {
        Product: {
          include: { User: true }
        }
      }
    });

    if (!transaction) {
      console.error('Transaction not found for reference:', reference);
      return;
    }

    if (transaction.status === 'SUCCESS') {
      console.log('Transaction already processed:', reference);
      return;
    }

    // Mark product as sold
    await prisma.product.update({
      where: { id: transaction.productId },
      data: { isSold: true }
    });

    // Update transaction as successful
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: 'SUCCESS',
        paidAt: new Date(),
        paymentMethod: data.channel || 'card'
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
          paymentMethod: data.channel,
          gatewayResponse: data.gateway_response
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

    console.log('Successfully processed payment:', reference);

  } catch (error) {
    console.error('Error handling successful charge:', error);
  }
}

async function handleFailedCharge(data: any) {
  try {
    const reference = data.reference;
    
    // Find transaction by reference
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { reference },
      include: { Product: true }
    });

    if (!transaction) {
      console.error('Transaction not found for reference:', reference);
      return;
    }

    // Update transaction as failed
    await prisma.paymentTransaction.update({
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
          gatewayResponse: data.gateway_response
        }
      }
    });

    console.log('Processed failed payment:', reference);

  } catch (error) {
    console.error('Error handling failed charge:', error);
  }
}

async function handleSuccessfulTransfer(data: any) {
  // Handle transfer success (for seller payouts)
  console.log('Transfer successful:', data);
}

async function handleFailedTransfer(data: any) {
  // Handle transfer failure
  console.log('Transfer failed:', data);
}
