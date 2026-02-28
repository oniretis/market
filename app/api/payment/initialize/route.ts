import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { prisma } from '@/lib/prisma';
import { Paystack } from 'paystack-sdk';

// Initialize Paystack with secret key
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    console.log('Payment initialization started');

    // Check if Paystack is configured
    if (!paystackSecretKey || paystackSecretKey === 'sk_test_your_paystack_secret_key') {
      console.error('Paystack not properly configured');
      return NextResponse.json(
        { error: 'Payment system not properly configured. Please contact support.' },
        { status: 500 }
      );
    }

    console.log('Paystack configured, creating instance...');
    const paystackInstance = new Paystack(paystackSecretKey);
    console.log('Paystack instance created:', !!paystackInstance);

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, email, amount, callback_url } = body;

    console.log('Request body:', { productId, email, amount, callback_url });

    // Validate input
    if (!productId || !email || !amount) {
      console.log('Missing required fields:', { productId: !!productId, email: !!email, amount: !!amount });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId, status: "APPROVED" },
      select: { id: true, name: true, price: true, isSold: true }
    });

    if (!product) {
      console.log('Product not found:', productId);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.isSold) {
      console.log('Product already sold:', productId);
      return NextResponse.json({ error: 'Product already sold' }, { status: 400 });
    }

    console.log('Product found:', product.name, 'Price:', product.price);

    // Verify amount matches product price (in kobo)
    const expectedAmount = product.price * 100; // Convert to kobo
    if (amount !== expectedAmount) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    // Create transaction record
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        productId: productId,
        amount: product.price,
        status: 'PENDING',
        reference: '', // Will be updated after Paystack response
        paystackReference: '', // Will be updated after Paystack response
        email: email,
      }
    });

    console.log('Transaction created:', transaction.id);

    // Initialize Paystack transaction
    console.log('Calling Paystack API with:', {
      amount: expectedAmount,
      email: email,
      reference: transaction.id,
      callback_url: callback_url || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`
    });

    const paystackResponse = await paystackInstance.transaction.initialize({
      amount: expectedAmount,
      email: email,
      reference: transaction.id, // Use our transaction ID as reference
      callback_url: callback_url || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      metadata: {
        productId: productId,
        userId: user.id,
        transactionId: transaction.id,
        custom_fields: [
          {
            display_name: "Product Name",
            variable_name: "product_name",
            value: product.name
          },
          {
            display_name: "Product ID",
            variable_name: "product_id",
            value: product.id
          }
        ]
      }
    });

    console.log('Paystack API response:', paystackResponse);
    console.log('Paystack response status:', paystackResponse?.status);
    console.log('Paystack response data:', paystackResponse?.data);

    if (!paystackResponse.status) {
      console.error('Paystack initialization failed:', paystackResponse);
      // Update transaction as failed
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' }
      });

      return NextResponse.json(
        { error: 'Failed to initialize payment with payment provider' },
        { status: 500 }
      );
    }

    // Update transaction with Paystack reference
    if (paystackResponse.status && paystackResponse.data) {
      console.log('Updating transaction with Paystack reference...');
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          reference: paystackResponse.data.reference,
          paystackReference: paystackResponse.data.reference
        }
      });
      console.log('Transaction updated successfully');

      // Log activity
      await prisma.activity.create({
        data: {
          userId: user.id,
          action: 'PAYMENT_INITIATED',
          description: `Payment initiated for product: ${product.name}`,
          metadata: {
            productId: productId,
            transactionId: transaction.id,
            amount: product.price,
            reference: paystackResponse.data.reference
          }
        }
      });
      console.log('Activity logged successfully');

      console.log('Payment initialized successfully');
      console.log('Returning authorization URL:', paystackResponse.data.authorization_url);

      return NextResponse.json({
        success: true,
        data: {
          authorization_url: paystackResponse.data.authorization_url,
          access_code: paystackResponse.data.access_code,
          reference: paystackResponse.data.reference,
          transactionId: transaction.id
        }
      });
    } else {
      console.error('Invalid Paystack response:', paystackResponse);
      return NextResponse.json(
        { error: 'Failed to initialize payment with Paystack' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error during payment initialization' },
      { status: 500 }
    );
  }
}
