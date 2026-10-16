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
import { formatPrice } from "@/lib/utils";
import { PAKISTAN_CITIES, getShippingFee } from "@/lib/constants";
import { LogIn } from "lucide-react";

const emptySubscribe = () => () => {};

export default function CheckoutPage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { items, getSubtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [prefilledName, setPrefilledName] = useState("");
  const [prefilledPhone, setPrefilledPhone] = useState("");
  const [prefilledAddress, setPrefilledAddress] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single();

        if (profile?.full_name) setPrefilledName(profile.full_name);
        if (profile?.phone) setPrefilledPhone(profile.phone);

        // Fetch their most recent order to prefill address & city if available
        const { data: recentOrder } = await supabase
          .from("orders")
          .select("shipping_name, shipping_phone, shipping_address, shipping_city")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (recentOrder) {
          if (!profile?.full_name && recentOrder.shipping_name) {
            setPrefilledName(recentOrder.shipping_name);
          }
          if (!profile?.phone && recentOrder.shipping_phone) {
            setPrefilledPhone(recentOrder.shipping_phone);
          }
          if (recentOrder.shipping_address) {
            setPrefilledAddress(recentOrder.shipping_address);
          }
          if (recentOrder.shipping_city) {
            const rawCity = recentOrder.shipping_city.trim();
            const matchedCity = PAKISTAN_CITIES.find(
              (c) => c.toLowerCase() === rawCity.toLowerCase()
            );
            if (matchedCity) {
              setSelectedCity(matchedCity);
            } else {
              setSelectedCity("other");
              setCustomCity(rawCity);
            }
          }
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    fetchProfile();
  }, []);

  const effectiveCity =
    selectedCity === "other" ? customCity.trim() : selectedCity.trim();
  const shippingFee = getShippingFee(effectiveCity);
  const subtotal = getSubtotal();
  const total = effectiveCity ? subtotal + shippingFee : subtotal;

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
    setError(null);

    if (!effectiveCity) {
      setError("Please select or enter your city");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("city", effectiveCity);

    const result = await placeOrderAction(items, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      clearCart();
      if (result.honeypot || result.orderNumber === 0) {
        router.push("/order-success?order=0");
      } else if (result.isLoggedIn && result.orderId) {
        router.push(`/orders/${result.orderId}?placed=1`);
      } else if (result.orderNumber) {
        router.push(`/order-success?order=${result.orderNumber}`);
      } else {
        router.push("/order-success");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                {error}
              </div>
            )}

            {/* Guest notice */}
            {isLoggedIn === false && (
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl text-sm text-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>Checking out as guest. Already have an account?</span>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline shrink-0"
                >
                  <LogIn className="w-4 h-4" /> Login
                </Link>
              </div>
            )}

            {/* Hidden honeypot field for bot mitigation */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              className="sr-only absolute -z-10 opacity-0 pointer-events-none"
              aria-hidden="true"
            />

            {/* Hidden input to ensure city is submitted reliably */}
            <input type="hidden" name="city" value={effectiveCity} />

            <div className="space-y-4">
              <h2 className="text-xl font-bold">Shipping Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <Input
                    name="name"
                    required
                    defaultValue={prefilledName}
                    key={`name-${prefilledName}`}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Phone *</label>
                  <Input
                    name="phone"
                    required
                    type="tel"
                    minLength={10}
                    defaultValue={prefilledPhone}
                    key={`phone-${prefilledPhone}`}
                    placeholder="03001234567"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Email (optional)</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address *</label>
                  <Input
                    name="address"
                    required
                    defaultValue={prefilledAddress}
                    key={`address-${prefilledAddress}`}
                    placeholder="Street address, building, apartment or house #"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="city-select" className="text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <select
                    id="city-select"
                    required
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-light focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Select your city *</option>
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="other">Other (type your city)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Delivery: Karachi Rs. 250, other cities Rs. 350
                  </p>
                </div>

                {selectedCity === "other" && (
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="custom-city" className="text-sm font-medium text-gray-700">
                      City Name *
                    </label>
                    <Input
                      id="custom-city"
                      required
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder="e.g. Sukkur, Abbottabad, Mardan"
                      autoFocus
                    />
                  </div>
                )}
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
              <p className="text-sm text-gray-500">Pay cash when your order arrives at your doorstep.</p>
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
                    <p className="font-medium mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>
                  {effectiveCity && effectiveCity.toLowerCase() === "karachi"
                    ? "Delivery (Karachi)"
                    : "Delivery"}
                </span>
                {effectiveCity ? (
                  <span className="font-medium text-gray-900">{formatPrice(shippingFee)}</span>
                ) : (
                  <span className="text-gray-500 font-medium">Select city</span>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-3xl text-gray-900">{formatPrice(total)}</span>
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
