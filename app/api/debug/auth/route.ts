import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/admin";

export async function GET() {
  try {
    console.log('Checking current authentication status...');
    
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('No user authenticated');
      return NextResponse.json({
        authenticated: false,
        user: null,
        message: "No user is currently logged in"
      });
    }
    
    console.log('User authenticated:', user.email, 'Role:', user.role);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      message: `User ${user.email} is logged in with role: ${user.role}`
    });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      error: error.message,
      message: "Error checking authentication status"
    }, { status: 500 });
  }
}
