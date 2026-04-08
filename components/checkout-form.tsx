"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { FormErrors } from "@/lib/types";
import { VALIDATION_MESSAGES } from "@/lib/types";

export function CheckoutForm() {
  const router = useRouter();
  const checkoutData = useStore((state) => state.checkoutData);
  const setCheckoutData = useStore((state) => state.setCheckoutData);
  const selectedLocation = useStore((state) => state.selectedLocation);
  const setCompletedOrder = useStore((state) => state.setCompletedOrder);
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!checkoutData.fullName.trim()) {
      newErrors.fullName = VALIDATION_MESSAGES.required;
    } else if (checkoutData.fullName.trim().length < 3) {
      newErrors.fullName = VALIDATION_MESSAGES.minLength(3);
    }

    if (!checkoutData.phone.trim()) {
      newErrors.phone = VALIDATION_MESSAGES.required;
    } else if (!/^[\d\s+()-]{8,15}$/.test(checkoutData.phone.trim())) {
      newErrors.phone = VALIDATION_MESSAGES.invalidPhone;
    }

    if (!checkoutData.address.trim()) {
      newErrors.address = VALIDATION_MESSAGES.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedLocation) return;

    setIsSubmitting(true);

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    
    setCompletedOrder({
      location: selectedLocation,
      checkout: checkoutData,
      orderId,
      orderDate: new Date().toISOString(),
    });

    router.push("/success");
  };

  const handleChange = (field: keyof typeof checkoutData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCheckoutData({ [field]: e.target.value });
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
          الاسم الكامل <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          id="fullName"
          value={checkoutData.fullName}
          onChange={handleChange("fullName")}
          placeholder="أدخل اسمك الكامل"
          className={`input-field ${errors.fullName ? "border-destructive focus:ring-destructive" : ""}`}
        />
        {errors.fullName && (
          <p className="mt-2 text-sm text-destructive flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
          رقم الهاتف <span className="text-destructive">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          value={checkoutData.phone}
          onChange={handleChange("phone")}
          placeholder="05xxxxxxxx"
          dir="ltr"
          className={`input-field text-right ${errors.phone ? "border-destructive focus:ring-destructive" : ""}`}
        />
        {errors.phone && (
          <p className="mt-2 text-sm text-destructive flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            {errors.phone}
          </p>
        )}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
          العنوان <span className="text-destructive">*</span>
        </label>
        <textarea
          id="address"
          value={checkoutData.address}
          onChange={handleChange("address")}
          placeholder="العنوان التفصيلي للتوصيل"
          rows={3}
          className={`input-field resize-none ${errors.address ? "border-destructive focus:ring-destructive" : ""}`}
        />
        {errors.address && (
          <p className="mt-2 text-sm text-destructive flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            {errors.address}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
          ملاحظات إضافية <span className="text-muted-foreground">(اختياري)</span>
        </label>
        <textarea
          id="notes"
          value={checkoutData.notes}
          onChange={handleChange("notes")}
          placeholder="أي تعليمات خاصة للتوصيل..."
          rows={2}
          className="input-field resize-none"
        />
      </div>

      {/* Payment Method */}
      <div className="bg-accent/50 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary">
              <path
                fillRule="evenodd"
                d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM1.75 14.5a.75.75 0 0 0 0 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 0 0-1.5 0v.784a.272.272 0 0 1-.35.25A49.043 49.043 0 0 0 1.75 14.5Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-foreground">الدفع عند الاستلام</p>
            <p className="text-sm text-muted-foreground">ادفع نقداً عند استلام طلبك</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !selectedLocation}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>جاري إرسال الطلب...</span>
          </>
        ) : (
          <>
            <span>تأكيد الطلب</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 rotate-180">
              <path
                fillRule="evenodd"
                d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
