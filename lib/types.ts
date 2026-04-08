export interface MapPosition {
  lat: number;
  lng: number;
}

export interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
}

export const VALIDATION_MESSAGES = {
  required: "هذا الحقل مطلوب",
  invalidPhone: "رقم الهاتف غير صالح",
  minLength: (min: number) => `يجب أن يكون على الأقل ${min} أحرف`,
} as const;

export const DEFAULT_MAP_CENTER: MapPosition = {
  lat: 24.7136,
  lng: 46.6753,
};

export const DEFAULT_MAP_ZOOM = 13;
