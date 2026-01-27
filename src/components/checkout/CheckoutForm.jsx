import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import LoadingSpinner from '../common/LoadingSpinner';

const CheckoutForm = ({ clientSecret, onSuccess, onBack, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Payment failed
        setErrorMessage(error.message || 'An error occurred during payment');
        setIsProcessing(false);
      } else {
        // Payment successful
        onSuccess();
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-semibold">Payment Error</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          <strong>Total to be charged: ${totalAmount.toFixed(2)}</strong>
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary flex-1"
          disabled={isProcessing}
        >
          Back
        </button>
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">Processing...</span>
            </span>
          ) : (
            `Pay $${totalAmount.toFixed(2)}`
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        By confirming your payment, you agree to our terms and conditions.
        Your payment information is securely processed by Stripe.
      </p>
    </form>
  );
};

export default CheckoutForm;
