"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { placeOrderAction } from "./actions";

const emptySubscribe = () => () => {};

export default function CheckoutPage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { items, getSubtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilledName, setPrefilledName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (data?.full_name) {
          setPrefilledName(data.full_name);
        }
      }
    };
    fetchProfile();
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-[50vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
        <p className="text-gray-500 mb-8">Your cart is empty. You cannot checkout without any items.</p>
        <Link href="/shop">
          <Button size="lg" className="w-full">
            Return to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await placeOrderAction(items, formData);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.orderId) {
      clearCart();
      router.push(`/orders/${result.orderId}?placed=1`);
    }
  };

  const subtotal = getSubtotal();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Shipping Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input name="name" required defaultValue={prefilledName} placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <Input name="phone" required type="tel" minLength={10} placeholder="1234567890" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <Input name="address" required placeholder="123 Main St, Apt 4B" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">City</label>
                  <Input name="city" required placeholder="New York" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="text-xl font-bold">Payment Method</h2>
              <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl flex items-center justify-between cursor-not-allowed">
                <span className="font-medium text-gray-900">Cash on Delivery</span>
                <div className="w-5 h-5 rounded-full border-4 border-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              </div>
              <p className="text-sm text-gray-500">Pay when your order arrives at your door.</p>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-gray-900 line-clamp-2">{item.name}</p>
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                    <p className="font-medium mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>
            
            <div className="h-px bg-gray-100 mb-6" />
            
            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-3xl text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            
            <Button 
              type="submit" 
              form="checkout-form" 
              size="lg" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
