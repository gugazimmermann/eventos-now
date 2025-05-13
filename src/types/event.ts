export interface Event {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  Address: {
    street: string;
    number: string | null;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  EventConfig: {
    confirmationType: string;
    hasGift: boolean;
    giftDescription: string;
    hasPrize: boolean;
    prizeDescription: string;
  }[];
}
