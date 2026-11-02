'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 49900, // ₹499 in paise
          currency: 'INR',
          description: 'BuildSphere Business Verification & Featured Listing',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to initiate payment');
        setLoading(false);
        return;
      }

      setOrder(data);
      toast.success('Test payment order generated successfully!');
    } catch {
      toast.error('Payment service test error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      {/* Header with mandatory badge */}
      <div className="text-center mb-8">
        <div className="inline-block mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Payments: test mode
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Employer Services Checkout
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Demonstration of Razorpay payment order generation in prototype environment.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="font-bold text-gray-900 text-base">
              Verified Business Badge
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Instant verification & 30-day listing priority boost
            </p>
          </div>
          <span className="text-xl font-extrabold text-orange-600">₹499</span>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 text-xs text-gray-600 space-y-2">
          <div className="flex justify-between font-medium">
            <span>Currency</span>
            <span>INR (Indian Rupee)</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Gateway Integration</span>
            <span>Razorpay Orders API (Stub / Sandbox)</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Status</span>
            <span className="text-amber-700 font-bold">Payments: test mode</span>
          </div>
        </div>

        {order ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <span>✅</span>
              <span>Test Order Generated Successfully</span>
            </div>
            <p className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-200 break-all">
              Order ID: {order.id}<br />
              Amount: ₹{order.amount / 100} INR<br />
              Status: {order.status} ({order.notes?.environment || 'stub_mode'})
            </p>
            <p className="text-emerald-700 mt-1">
              In production, Razorpay Standard Checkout opens here to accept UPI, Cards, and NetBanking.
            </p>
          </div>
        ) : (
          <Button
            onClick={handleSimulatePayment}
            isLoading={loading}
            className="w-full py-3"
          >
            Simulate Razorpay Test Payment (₹499)
          </Button>
        )}

        <p className="text-center text-[11px] text-gray-400">
          No real transactions will occur. This prototype is configured in Payments: test mode.
        </p>
      </Card>
    </div>
  );
}

