"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Home, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductPendingPage() {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className={`max-w-md w-full transition-all duration-1000 transform ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Product Submitted Successfully!
            </CardTitle>
            <CardDescription className="text-gray-600 text-base mt-2">
              Thank you for listing your product. It&apos;s now pending review and will be live once approved by our admin team.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900">What happens next?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Our admin team will review your product within 24-48 hours. Once approved, it will be visible to all buyers on the platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-purple-900">Review Process</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    We check for quality, accuracy, and compliance with our marketplace guidelines to ensure the best experience for all users.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                <Link href="/" className="flex items-center justify-center">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>

              <Button asChild variant="outline" className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 transition-all duration-200">
                <Link href="/sell" className="flex items-center justify-center">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Sell Another
                </Link>
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Questions? Contact our support team at{" "}
                <a href="mailto:support@marketplace.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  support@marketplace.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
