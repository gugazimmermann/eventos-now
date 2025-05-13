interface EventConfigProps {
  config: {
    confirmationType: string;
    hasGift: boolean;
    giftDescription: string;
    hasPrize: boolean;
    prizeDescription: string;
  };
}

export default function EventConfig({ config }: EventConfigProps) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Configurações</h2>
      <p>Tipo de Confirmação: {config.confirmationType}</p>
      {config.hasGift && <p>Brinde: {config.giftDescription}</p>}
      {config.hasPrize && <p>Prêmio: {config.prizeDescription}</p>}
    </div>
  );
}
