import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    console.log('Test API: Checking database models...');

    // Test basic database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection: OK');

    // Test if Advertisement model exists
    try {
      const ads = await (prisma as any).advertisement.count();
      console.log(`Advertisement model: OK (${ads} ads found)`);
      return NextResponse.json({
        status: 'ok',
        adsCount: ads,
        message: 'Advertisement model working'
      });
    } catch (modelError: any) {
      console.error('Advertisement model error:', modelError);
      return NextResponse.json({
        status: 'error',
        error: modelError.message || String(modelError),
        message: 'Advertisement model not working'
      });
    }
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message || String(error)
    });
  }
}
