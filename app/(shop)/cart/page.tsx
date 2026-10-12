"use client";

import { useSyncExternalStore } from "react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Trash2, Minus, Plus, ArrowRight } from "lucide-react";

const emptySubscribe = () => () => {};

export default function CartPage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();

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
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link href="/shop">
          <Button size="lg" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.productId} className="flex flex-col sm:flex-row gap-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Link href={`/product/${item.slug}`} className="shrink-0">
                  <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                    )}
                  </div>
                </Link>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/product/${item.slug}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="text-lg font-bold text-gray-900 mb-4">${item.price}</div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="font-semibold text-lg text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
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
            
            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full gap-2">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
