"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";

import {
  mainGuestCheckInSchema,
  CheckInFormValues,
} from "@/schemas/mainGuestCheckInSchema";
import { Booking } from "@/types/bookings/types";
import { MainGuestSection } from "./MainGuestSection";
import { CompanionsSection } from "./CompanionsSection";
import { BookingCheckInFormFooter } from "./BookingCheckInFormFooter";

interface BookingCheckInFormProps {
  booking: Booking;
  onSubmit: (data: CheckInFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BookingCheckInForm({
  booking,
  onSubmit,
  onCancel,
  isLoading,
}: BookingCheckInFormProps) {
  // parse check-in and check-out dates for default form values
  const defaultCheckIn = new Date(booking.checkIn);
  const defaultCheckOut = new Date(booking.checkOut);

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(mainGuestCheckInSchema),
    defaultValues: {
      customerId: booking.mainGuest.customerId || undefined,
      firstName: booking.mainGuest.firstName || "",
      lastName: booking.mainGuest.lastName || "",
      arrivalDate: booking.mainGuest.arrivalDate
        ? new Date(booking.mainGuest.arrivalDate)
        : defaultCheckIn,
      departureDate: booking.mainGuest.departureDate
        ? new Date(booking.mainGuest.departureDate)
        : defaultCheckOut,
      email: booking.mainGuest.email || "",
      phone: booking.mainGuest.phone || "",
      sex: booking.mainGuest.sex || "M",
      citizenship: booking.mainGuest.citizenship || "IT",
      placeOfBirth: booking.mainGuest.placeOfBirth || "",
      guestType: booking.mainGuest.guestType || "ADULT",
      guestRole: booking.mainGuest.guestRole || "HEAD_OF_GROUP",
      documentType: booking.mainGuest.documentType || "ID_CARD",
      documentNumber: booking.mainGuest.documentNumber || "",
      documentPlaceOfIssue: booking.mainGuest.documentPlaceOfIssue || "",
      notes: booking.notes || "",
      birthDate: booking.mainGuest.birthDate
        ? new Date(booking.mainGuest.birthDate)
        : undefined,
      companions:
        booking.companions?.map((c) => ({
          customerId: c.customerId || undefined,
          firstName: c.firstName,
          lastName: c.lastName,
          arrivalDate: c.arrivalDate ? new Date(c.arrivalDate) : defaultCheckIn,
          departureDate: c.departureDate
            ? new Date(c.departureDate)
            : defaultCheckOut,
          sex: c.sex || "M",
          birthDate: c.birthDate ? new Date(c.birthDate) : new Date(),
          citizenship: c.citizenship || "IT",
          placeOfBirth: c.placeOfBirth || "",
          guestType: c.guestType || "ADULT",
          guestRole: c.guestRole || "MEMBER",
        })) || [],
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full max-h-[80vh]"
      >
        {/* main content */}
        <ScrollArea className="flex-1 max-h-[calc(80vh-16rem)] pr-4">
          <div className="space-y-4 p-1">
            {/* Main Guest */}
            <MainGuestSection
              control={form.control}
              checkInDate={booking.checkIn}
              checkOutDate={booking.checkOut}
            />

            <Separator />

            {/* Companions */}
            <CompanionsSection
              control={form.control}
              checkInDate={booking.checkIn}
              checkOutDate={booking.checkOut}
            />
          </div>
        </ScrollArea>

        {/* Footer */}
        <BookingCheckInFormFooter
          isEditCheckIn={booking.status === "CHECKED_IN"}
          control={form.control}
          isLoading={isLoading}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
