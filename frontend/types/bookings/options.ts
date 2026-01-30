import {
  BookingStatus,
  PaymentStatus,
  Sex,
  GuestRole,
  DocumentType,
} from "./enums";

export const bookingStatusOptions = [
  { label: "In attesa", value: BookingStatus.PENDING },
  { label: "Confermata", value: BookingStatus.CONFIRMED },
  { label: "Check-in", value: BookingStatus.CHECKED_IN },
  { label: "Check-out", value: BookingStatus.CHECKED_OUT },
  { label: "Cancellata", value: BookingStatus.CANCELLED },
];

export const paymentStatusOptions = [
  { label: "Non Saldato", value: PaymentStatus.UNPAID },
  { label: "Acconto", value: PaymentStatus.DEPOSIT_PAID },
  { label: "Saldato", value: PaymentStatus.PAID_IN_FULL },
  { label: "Rimborsato", value: PaymentStatus.REFUNDED }, // fixme: rimuovere se non usato
];

export const documentTypeOptions = [
  { label: "Carta d'Identità", value: DocumentType.ID_CARD },
  { label: "Passaporto", value: DocumentType.PASSPORT },
  { label: "Patente di Guida", value: DocumentType.DRIVER_LICENSE },
  { label: "Altro", value: DocumentType.OTHER },
];

export const sexOptions = [
  { label: "Uomo", value: Sex.M },
  { label: "Donna", value: Sex.F },
];

export const guestRoleOptions = [
  { label: "Capofamiglia", value: GuestRole.HEAD_OF_FAMILY },
  { label: "Capogruppo", value: GuestRole.HEAD_OF_GROUP },
  { label: "Membro", value: GuestRole.MEMBER },
];

export const guestTypeOptions = [
  { label: "Adulto", value: "ADULT" },
  { label: "Bambino", value: "CHILD" },
  { label: "Neonato", value: "INFANT" },
];
