// resources
export const resourceKeys = {
  all: ["resources"] as const, // ['resources']
  detail: (id: string) => [...resourceKeys.all, id] as const, // ['resources', id]
};

// bookings
export const bookingKeys = {
  all: ["bookings"] as const, // ['bookings']
  detail: (id: string) => [...bookingKeys.all, id] as const, // ['bookings', id]
  unavailable: (resourceId: string | undefined, excludeBookingId?: string) =>
    [...bookingKeys.all, "unavailable", resourceId, excludeBookingId] as const, // ['bookings', 'unavailable', resourceId, excludeBookingId]
};

// extra options
export const extraOptionKeys = {
  all: ["extra-options"] as const, // ['extra-options']
  list: (includeInactive: boolean) =>
    [...extraOptionKeys.all, "list", { includeInactive }] as const, // ['extra-options', 'list', { includeInactive }]
  detail: (id: string) => [...extraOptionKeys.all, "detail", id] as const, // ['extra-options', 'detail', id]
};
