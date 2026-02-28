import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function CancelRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Payment Canceled</CardTitle>
          <CardDescription>
            Your payment was canceled and you haven&apos;t been charged
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              The payment process was interrupted. No charges were made to your account.
            </p>
            <p className="text-sm text-muted-foreground">
              You can try again or contact support if you continue to experience issues.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Homepage
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/products">
                <RefreshCw className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
