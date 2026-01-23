// resources
export const resourceKeys = {
  all: ["resources"] as const, // ['resources']
  detail: (id: string) => [...resourceKeys.all, id] as const, // ['resources', id]
};

// bookings
export const bookingKeys = {
  all: ["bookings"] as const, // ['bookings']
  detail: (id: string) => [...bookingKeys.all, id] as const, // ['bookings', id]
};
