import { ExtraCategory } from "./enums";

// booking snapshot extra
export interface BookingExtra {
  extraOptionId: string;
  nameSnapshot: string;
  descriptionSnapshot?: string;
  priceSnapshot: number;
  quantity: number;
}

export interface ExtraOption {
  id: string;
  name: string;
  description?: string;
  defaultPrice: number;
  category: ExtraCategory;
  isActive: boolean;
}
