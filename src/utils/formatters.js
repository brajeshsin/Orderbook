export const formatPrice = (price) =>
  price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const formatAmount = (amount) => amount.toFixed(4)
