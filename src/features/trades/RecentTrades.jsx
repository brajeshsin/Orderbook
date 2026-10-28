import { formatPrice, formatAmount } from '../../utils/formatters'

const demoTrades = [
  [67320, 0.0241, '10:03:12', 'buy'],
  [67318.5, 0.1052, '10:03:10', 'sell'],
  [67321, 0.0084, '10:03:08', 'buy'],
  [67315, 0.0521, '10:03:05', 'sell'],
  [67325, 0.0148, '10:03:02', 'buy'],
  [67320.5, 0.0713, '10:02:58', 'buy'],
  [67317, 0.0338, '10:02:55', 'sell'],
  [67322, 0.0421, '10:02:51', 'buy'],
  [67314, 0.0192, '10:02:48', 'sell'],
  [67319, 0.0614, '10:02:45', 'buy'],
]

export default function RecentTrades({ trades = demoTrades }) {
  return (
    <article className="min-w-0 overflow-hidden rounded border border-[#2b3139] bg-[#161a1e]">
      <div className="flex h-12 items-center border-b border-[#2b3139] px-4">
        <h2 className="text-sm font-semibold">Recent Trades</h2>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 py-3 text-[10px] text-gray-500">
        <span>Price (USDT)</span>
        <span className="text-right">Amount (BTC)</span>
        <span className="text-right">Time</span>
      </div>

      {trades.map(([price, amount, time, side], index) => (
        <div
          key={`${time}-${index}`}
          className="grid h-[35px] grid-cols-3 items-center gap-2 px-3 text-[10px] tabular-nums hover:bg-white/[0.03]"
        >
          <span className={side === 'buy' ? 'text-emerald-400' : 'text-rose-500'}>
            {formatPrice(price)}
          </span>
          <span className="text-right">{formatAmount(amount)}</span>
          <span className="text-right text-gray-400">{time}</span>
        </div>
      ))}
    </article>
  )
}
