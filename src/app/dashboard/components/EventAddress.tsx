interface Address {
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

const formatAddress = (address: Address) => {
  const parts = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    `${address.city} - ${address.state}`,
    address.zipCode,
  ].filter(Boolean);

  return parts.join('\n');
};

interface EventAddressProps {
  address: Address;
}

export default function EventAddress({ address }: EventAddressProps) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Local</h2>
      <p className="whitespace-pre-line">{formatAddress(address)}</p>
    </div>
  );
}
