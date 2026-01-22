// resources
export const resourceKeys = {
  all: ["resources"] as const, // ['resources']
  detail: (id: string) => [...resourceKeys.all, id] as const, // ['resources', id]
};