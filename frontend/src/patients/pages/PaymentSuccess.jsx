import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Calendar } from "lucide-react";

import { verifyPayment } from "@/api/services/paymentService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    async function handleVerify() {
      if (!sessionId) {
        setStatus("error");
        setError("Missing session ID. We couldn't verify your payment.");
        return;
      }

      try {
        const response = await verifyPayment(sessionId);
        if (response.data.success) {
          setPaymentData(response.data.payment);
          setStatus("success");
        } else {
          throw new Error("Verification failed on server.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setError(err.message || "An error occurred while verifying your payment.");
      }
    }

    handleVerify();
  }, [sessionId]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-green-500">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
            {status === "error" && <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Verifying Payment..."}
            {status === "success" && "Payment Successful!"}
            {status === "error" && "Payment Verification Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we confirm your transaction with Stripe."}
            {status === "success" && "Your appointment has been successfully paid and confirmed."}
            {status === "error" && error}
          </CardDescription>
        </CardHeader>

        {status === "success" && paymentData && (
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Amount Paid</span>
                <span className="font-medium text-foreground">
                  {paymentData.amount} {paymentData.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Payment Method</span>
                <span className="font-medium text-foreground capitalized">{paymentData.provider}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Transaction Date</span>
                <span className="font-medium text-foreground">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground italic">
              A confirmation email has been sent to your registered address.
            </p>
          </CardContent>
        )}

        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full" variant={status === "success" ? "default" : "outline"}>
            <Link to="/patient/appointments/approved">
              <Calendar className="mr-2 h-4 w-4" />
              View My Appointments
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
