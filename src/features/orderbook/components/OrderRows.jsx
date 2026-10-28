import { formatPrice, formatAmount } from '../../../utils/formatters'

export default function OrderRows({ orders, side, displayMode = 'cumulative', pricePrecision = 0.01 }) {
  const groupedOrders = Object.values(
    orders.reduce((groups, order) => {
      const scaledPrice = order.price / pricePrecision
      const price =
        (side === 'ask' ? Math.ceil(scaledPrice - 1e-9) : Math.floor(scaledPrice + 1e-9)) *
        pricePrecision
      const key = price.toFixed(8)

      if (!groups[key]) {
        groups[key] = { price, amount: 0 }
      }

      groups[key].amount += order.amount
      return groups
    }, {}),
  )

  const sortedOrders = groupedOrders.sort((a, b) =>
    side === 'ask' ? b.price - a.price : b.price - a.price,
  )

  const rows = sortedOrders.reduce((result, order) => {
    const previousTotal = result.length
      ? result[result.length - 1].cumulativeAmount
      : 0

    result.push({
      ...order,
      cumulativeAmount: previousTotal + order.amount,
    })

    return result
  }, [])

  const maxDepth = Math.max(
    0,
    ...rows.map((order) =>
      displayMode === 'cumulative' ? order.cumulativeAmount : order.amount,
    ),
  )

  return (
    <div>
      {rows.map((order) => {
        const depthAmount =
          displayMode === 'cumulative' ? order.cumulativeAmount : order.amount
        const depth =
          maxDepth > 0 ? (depthAmount / maxDepth) * 100 : 0

        return (
          <div
            key={order.price}
            className="relative grid h-[29px] grid-cols-3 items-center gap-2 px-3 text-[11px] tabular-nums hover:bg-white/[0.04]"
          >
            <div
              className={`absolute bottom-0 right-0 top-0 ${
                side === 'ask' ? 'bg-rose-500/15' : 'bg-emerald-500/15'
              }`}
              style={{ width: `${depth}%` }}
            />
            <span
              className={`relative ${
                side === 'ask' ? 'text-rose-500' : 'text-emerald-400'
              }`}
            >
              {formatPrice(order.price)}
            </span>
            <span className="relative text-right">
              {formatAmount(order.amount)}
            </span>
            <span className="relative text-right text-gray-300">
              {formatAmount(order.cumulativeAmount)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
