import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export interface CheckoutData {
  fullName: string;
  phone: string;
  address: string;
  notes: string;
}

export interface OrderData {
  location: LocationData;
  checkout: CheckoutData;
  orderId: string;
  orderDate: string;
}

interface StoreState {
  // Location state
  selectedLocation: LocationData | null;
  setSelectedLocation: (location: LocationData | null) => void;

  // Checkout state
  checkoutData: CheckoutData;
  setCheckoutData: (data: Partial<CheckoutData>) => void;

  // Order state
  completedOrder: OrderData | null;
  setCompletedOrder: (order: OrderData | null) => void;

  // Reset
  resetStore: () => void;
}

const initialCheckoutData: CheckoutData = {
  fullName: "",
  phone: "",
  address: "",
  notes: "",
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      selectedLocation: null,
      setSelectedLocation: (location) => set({ selectedLocation: location }),

      checkoutData: initialCheckoutData,
      setCheckoutData: (data) =>
        set((state) => ({
          checkoutData: { ...state.checkoutData, ...data },
        })),

      completedOrder: null,
      setCompletedOrder: (order) => set({ completedOrder: order }),

      resetStore: () =>
        set({
          selectedLocation: null,
          checkoutData: initialCheckoutData,
          completedOrder: null,
        }),
    }),
    {
      name: "mapz-store",
    }
  )
);
