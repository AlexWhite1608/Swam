export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  CHECKED_OUT: "CHECKED_OUT",
  CANCELLED: "CANCELLED",
} as const;

export const PaymentStatus = {
  UNPAID: "UNPAID",
  DEPOSIT_PAID: "DEPOSIT_PAID",
  PAID_IN_FULL: "PAID_IN_FULL",
  REFUNDED: "REFUNDED", // fixme: rimuovere se non usato
} as const;

export const DocumentType = {
  ID_CARD: "ID_CARD",
  PASSPORT: "PASSPORT",
  DRIVER_LICENSE: "DRIVER_LICENSE",
  OTHER: "OTHER",
} as const;

export const GuestType = {
  ADULT: "ADULT",
  CHILD: "CHILD",
  INFANT: "INFANT",
} as const;

export const Sex = {
  M: "M",
  F: "F",
} as const;

export const GuestRole = {
  HEAD_OF_FAMILY: "HEAD_OF_FAMILY",
  HEAD_OF_GROUP: "HEAD_OF_GROUP",
  MEMBER: "MEMBER",
} as const;