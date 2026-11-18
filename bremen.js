const euros = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });

export function formatRange([minimum, maximum]) {
  return `${euros.format(minimum)} – ${euros.format(maximum)} €`;
}

export const installationCosts = [
  { name: 'Transport und Lieferung', price: [200, 600] },
  { name: 'Installation und Inbetriebnahme', price: [800, 2000] },
];

export function sumCosts(items) {
  return items.reduce(([minimum, maximum], { price }) => [minimum + price[0], maximum + price[1]], [0, 0]);
}
