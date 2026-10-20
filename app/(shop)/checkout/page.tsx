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
import {
  normalizePkPhone,
  isValidEmail,
  trimAndCollapse,
  NAME_MAX,
  ADDRESS_MAX,
  CITY_MAX,
  EMAIL_MAX,
} from "@/lib/validation";
import { LogIn } from "lucide-react";

const emptySubscribe = () => () => {};

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  email?: string;
}

export default function CheckoutPage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { items, getSubtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Form fields state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [customCity, setCustomCity] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setIsLoggedIn(true);
        if (user.email) setEmail(user.email);

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single();

        if (profile?.full_name) setName(profile.full_name);
        if (profile?.phone) setPhone(profile.phone);

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
            setName(recentOrder.shipping_name);
          }
          if (!profile?.phone && recentOrder.shipping_phone) {
            setPhone(recentOrder.shipping_phone);
          }
          if (recentOrder.shipping_address) {
            setAddress(recentOrder.shipping_address);
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

  const validateField = (
    fieldName: "name" | "phone" | "address" | "city" | "email",
    value: string
  ): string | undefined => {
    switch (fieldName) {
      case "name": {
        const trimmed = trimAndCollapse(value);
        if (!trimmed || trimmed.length < 2) {
          return "Full name must be at least 2 characters";
        }
        if (trimmed.length > NAME_MAX) {
          return `Full name cannot exceed ${NAME_MAX} characters`;
        }
        return undefined;
      }
      case "phone": {
        if (!normalizePkPhone(value)) {
          return "Enter a valid Pakistani mobile number (e.g. 0300 1234567)";
        }
        return undefined;
      }
      case "address": {
        const trimmed = trimAndCollapse(value);
        if (!trimmed || trimmed.length < 10) {
          return "Address must be at least 10 characters";
        }
        if (trimmed.length > ADDRESS_MAX) {
          return `Address cannot exceed ${ADDRESS_MAX} characters`;
        }
        return undefined;
      }
      case "city": {
        const trimmed = trimAndCollapse(value);
        if (!trimmed || trimmed.length < 2) {
          return "Please select or enter your city";
        }
        if (trimmed.length > CITY_MAX) {
          return `City cannot exceed ${CITY_MAX} characters`;
        }
        return undefined;
      }
      case "email": {
        const trimmed = value.trim();
        if (trimmed && !isValidEmail(trimmed)) {
          return "Please enter a valid email address";
        }
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const focusFirstErrorField = (fieldErrors: FormErrors) => {
    const fieldOrder: Array<keyof FormErrors> = [
      "name",
      "phone",
      "email",
      "address",
      "city",
    ];
    const firstKey = fieldOrder.find((k) => !!fieldErrors[k]);
    if (!firstKey) return;

    let targetId = `checkout-${firstKey}`;
    if (firstKey === "city") {
      targetId = selectedCity === "other" ? "custom-city" : "city-select";
    }

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.focus();
    }
  };

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
        <p className="text-gray-500 mb-8">
          Your cart is empty. You cannot checkout without any items.
        </p>
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

    // Validate all fields on submit
    const nameErr = validateField("name", name);
    const phoneErr = validateField("phone", phone);
    const addressErr = validateField("address", address);
    const cityErr = validateField("city", effectiveCity);
    const emailErr = validateField("email", email);

    const submissionErrors: FormErrors = {
      name: nameErr,
      phone: phoneErr,
      address: addressErr,
      city: cityErr,
      email: emailErr,
    };

    const hasErrors = Object.values(submissionErrors).some(Boolean);
    if (hasErrors) {
      setErrors(submissionErrors);
      focusFirstErrorField(submissionErrors);
      return;
    }

    const normalizedPhone = normalizePkPhone(phone);
    if (!normalizedPhone) {
      const err = {
        phone: "Enter a valid Pakistani mobile number (e.g. 0300 1234567)",
      };
      setErrors(err);
      focusFirstErrorField(err);
      return;
    }

    setLoading(true);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    formData.set("name", trimAndCollapse(name));
    // Submit the NORMALIZED phone (03XXXXXXXXX) to the server
    formData.set("phone", normalizedPhone);
    formData.set("address", trimAndCollapse(address));
    formData.set("city", effectiveCity);
    if (email.trim()) {
      formData.set("email", email.trim());
    } else {
      formData.delete("email");
    }

    const result = await placeOrderAction(items, formData);

    if (result.error) {
      setError(result.error);
      if (result.fieldErrors) {
        setErrors(result.fieldErrors);
        focusFirstErrorField(result.fieldErrors);
      }
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
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8" noValidate>
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
                  <label htmlFor="checkout-name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <Input
                    id="checkout-name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    onBlur={() => {
                      const err = validateField("name", name);
                      setErrors((prev) => ({ ...prev, name: err }));
                    }}
                    error={errors.name}
                    maxLength={NAME_MAX}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="checkout-phone" className="text-sm font-medium text-gray-700">
                    Phone *
                  </label>
                  <Input
                    id="checkout-phone"
                    name="phone"
                    required
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    onBlur={() => {
                      const err = validateField("phone", phone);
                      setErrors((prev) => ({ ...prev, phone: err }));
                    }}
                    error={errors.phone}
                    maxLength={20}
                    placeholder="03XX XXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pakistani mobile number, e.g. 0300 1234567
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="checkout-email" className="text-sm font-medium text-gray-700">
                    Email (optional)
                  </label>
                  <Input
                    id="checkout-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    onBlur={() => {
                      const err = validateField("email", email);
                      setErrors((prev) => ({ ...prev, email: err }));
                    }}
                    error={errors.email}
                    maxLength={EMAIL_MAX}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="checkout-address" className="text-sm font-medium text-gray-700">
                    Address *
                  </label>
                  <Input
                    id="checkout-address"
                    name="address"
                    required
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                    }}
                    onBlur={() => {
                      const err = validateField("address", address);
                      setErrors((prev) => ({ ...prev, address: err }));
                    }}
                    error={errors.address}
                    maxLength={ADDRESS_MAX}
                    placeholder="Street address, building, apartment or house #"
                  />
                  <p className="text-xs text-gray-500 mt-0.5">House/street, area</p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="city-select" className="text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <select
                    id="city-select"
                    required
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                    }}
                    onBlur={() => {
                      const eff = selectedCity === "other" ? customCity : selectedCity;
                      const err = validateField("city", eff);
                      setErrors((prev) => ({ ...prev, city: err }));
                    }}
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-all cursor-pointer ${
                      errors.city && selectedCity !== "other"
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary-light focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                    }`}
                  >
                    <option value="">Select your city *</option>
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="other">Other (type your city)</option>
                  </select>
                  {errors.city && selectedCity !== "other" && (
                    <span className="text-xs text-red-500 block mt-1">{errors.city}</span>
                  )}
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
                      onChange={(e) => {
                        setCustomCity(e.target.value);
                        if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                      }}
                      onBlur={() => {
                        const err = validateField("city", customCity);
                        setErrors((prev) => ({ ...prev, city: err }));
                      }}
                      error={errors.city}
                      maxLength={CITY_MAX}
                      placeholder="Enter your city name"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Notice */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Payment Method</h2>
              <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Cash on Delivery (COD)</div>
                  <div className="text-sm text-gray-500">
                    Pay with cash upon delivery to your doorstep
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-4 border-primary bg-white flex items-center justify-center" />
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
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
