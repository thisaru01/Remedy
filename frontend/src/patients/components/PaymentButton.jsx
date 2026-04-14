import { useState } from "react";
import { createPayment } from "@/api/services/paymentService";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function PaymentButton({ 
  appointmentId, 
  currency = "LKR", 
  disabled = false 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    if (!appointmentId) {
      setError("No appointment ID provided.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await createPayment({
        appointmentId,
        currency,
      });

      const { checkoutUrl } = response.data.payment;

      if (!checkoutUrl) {
        throw new Error("No checkout URL returned from server.");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Payment failed:", err);
      let errorMessage = "Failed to initiate payment.";
      if (err.data && err.data.message) {
          errorMessage = err.data.message;
      } else if (err.message) {
          errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        onClick={handlePayment}
        disabled={isLoading || disabled || !appointmentId}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay Now`
        )}
      </Button>
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}
