export function validateEntry(entry) {
  if (!Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 999) return 'invalidQuantity'
  if (!entry.color) return 'selectColor'
  if (entry.kind === 'transfer' && (!entry.destination || entry.room === entry.destination)) return 'sameRoom'
  return null
}
