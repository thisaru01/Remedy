import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Calendar, HelpCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentCancel() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-amber-500">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Cancelled</CardTitle>
          <CardDescription>
            The payment process was cancelled and no funds were withdrawn.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            If you experienced an issue with the payment provider or changed your mind, don't worry. Your appointment is still safe and you can try again later.
          </p>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
            <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Questions about billing? Contact our support team at <span className="font-medium text-foreground">support@remedy.com</span>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link to="/patient/appointments/approved">
              <Calendar className="mr-2 h-4 w-4" />
              Return to Appointments
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/patient">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
