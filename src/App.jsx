
import { useEffect, useState } from 'react'
import OrderRows from './features/orderbook/components/OrderRows'
import MarketChart from './features/chart/MarketChart'
import RecentTrades from './features/trades/RecentTrades'


const asks = [
  { price: 67450, amount: 0.4521 },
  { price: 67420, amount: 0.2814 },
  { price: 67390, amount: 0.6342 },
  { price: 67360, amount: 0.1925 },
  { price: 67330, amount: 0.5180 },
]

const bids = [
  { price: 67290, amount: 0.7842 },
  { price: 67260, amount: 0.3421 },
  { price: 67230, amount: 0.6215 },
  { price: 67200, amount: 0.2156 },
  { price: 67170, amount: 0.4932 },
]



function App() {
  const [bookView, setBookView] = useState('both')
  const [displayMode, setDisplayMode] = useState('cumulative')
  const [pricePrecision, setPricePrecision] = useState(0.01)
  const [orderSide, setOrderSide] = useState('buy')
  const [orderType, setOrderType] = useState('limit')
  const [orderPrice, setOrderPrice] = useState('')
  const [orderQuantity, setOrderQuantity] = useState('')

const [ticker, setTicker] = useState({
  price: null,
  change: null,
  high: null,
  low: null,
  volume: null,
  connected: false,
})

useEffect(() => {
  const ws = new WebSocket(
    'wss://stream.binance.com:9443/ws/btcusdt@ticker'
  )

  ws.onopen = () => {
    setTicker((previous) => ({ ...previous, connected: true }))
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)

    setTicker({
      price: Number(data.c),
      change: Number(data.P),
      high: Number(data.h),
      low: Number(data.l),
      volume: Number(data.v),
      connected: true,
    })
  }

  ws.onclose = () => {
    setTicker((previous) => ({ ...previous, connected: false }))
  }

  return () => ws.close()
}, [])


  const bestAsk = Math.min(...asks.map((order) => order.price))
  const bestBid = Math.max(...bids.map((order) => order.price))
  const spread = bestAsk - bestBid
  const midPrice = (bestAsk + bestBid) / 2

  const tabs = [
    ['both', 'Both sides'],
    ['buy', 'Buy'],
    ['sell', 'Sell'],
  ]

  return (
    <main className="min-h-screen bg-[#0b0e11] text-[#eaecef]">
      <header className="flex min-h-16 flex-wrap items-center gap-5 border-b border-[#2b3139] bg-[#181a20] px-4 py-3 lg:px-8">
        <a href="#markets" className="flex items-center gap-2 text-xl font-bold text-[#f0b90b]">
          <span className="grid size-7 rotate-45 place-items-center border-[3px] border-[#f0b90b]">
            <span className="-rotate-45">B</span>
          </span>
          Binance
        </a>

        <nav className="flex flex-1 flex-wrap gap-x-5 gap-y-2 text-xs sm:gap-x-7">
          <a href="#markets" className="hover:text-yellow-400">Markets</a>
          <a href="#trade" className="hover:text-yellow-400">Trade</a>
          <a href="#orderbook" className="hover:text-yellow-400">Order Book</a>
        </nav>

        <button className="rounded bg-[#f0b90b] px-5 py-2.5 text-sm font-semibold text-black hover:bg-yellow-300">
          Log In
        </button>
      </header>

      <section
        id="markets"
        className="flex flex-wrap items-center gap-x-8 gap-y-5 border-b border-[#2b3139] px-5 py-5 lg:px-8"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold">BTC/USDT</span>
          <span className="text-xs text-gray-500">Bitcoin</span>
          <span className={`size-2 rounded-full ${ticker.connected ? 'bg-emerald-400' : 'bg-rose-500'}`} title={ticker.connected ? 'Binance stream connected' : 'Binance stream disconnected'} />
        </div>

        <div>
          <p className="mb-1 text-[11px] text-gray-500">Last Price</p>
          <p className={`text-lg font-semibold ${
              ticker.price == null ? 'text-gray-400' : 'text-emerald-400'
            }`}>{ticker.price == null ? 'Loading...' : ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-gray-500">
            {ticker.price == null ? 'Waiting for Binance data' : `≈ $${ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
        </div>

        <div>
          <p className="mb-1 text-[11px] text-gray-500">24h Change</p>
          <p className={`text-sm ${
              ticker.change == null ? 'text-gray-400' : ticker.change >= 0 ? 'text-emerald-400' : 'text-rose-500'
            }`}>{ticker.change == null ? '--' : `${ticker.change >= 0 ? '+' : ''}${ticker.change.toFixed(2)}%`}</p>
        </div>

        <div>
          <p className="mb-1 text-[11px] text-gray-500">24h High</p>
          <p className="text-sm">{ticker.high == null ? '--' : ticker.high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div>
          <p className="mb-1 text-[11px] text-gray-500">24h Low</p>
          <p className="text-sm">{ticker.low == null ? '--' : ticker.low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div>
          <p className="mb-1 text-[11px] text-gray-500">24h Volume (BTC)</p>
          <p className="text-sm">{ticker.volume == null ? '--' : ticker.volume.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
        </div>
      </section>

      <section
        id="trade"
        className="grid grid-cols-1 items-start gap-2.5 p-2.5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,1fr)_minmax(280px,0.85fr)]"
      >
        <article className="min-w-0 overflow-hidden rounded border border-[#2b3139] bg-[#161a1e]">
          <div className="flex h-12 items-center justify-between border-b border-[#2b3139] px-4">
            <h2 className="text-sm font-semibold">BTC/USDT</h2>
            <span className="text-xs text-gray-500">Spot Market</span>
          </div>

          <div className="flex flex-wrap gap-4 border-b border-[#2b3139] px-4 py-3 text-xs text-gray-400">
            <span>Time</span>
            <span className="text-yellow-400">1D</span>
            <span>1W</span>
            <span>1M</span>
            <span className="ml-auto">Candlestick</span>
          </div>

          <MarketChart />

          <div className="border-t border-[#2b3139] px-4 py-3 text-[11px] text-gray-500">
            Illustrative candlestick data · Not live market data
          </div>
        </article>

        <article
          id="orderbook"
          className="min-w-0 overflow-hidden rounded border border-[#2b3139] bg-[#161a1e]"
        >
          <div className="flex h-12 items-center justify-between border-b border-[#2b3139] px-4">
            <h2 className="text-sm font-semibold">Order Book</h2>
            <span className="text-[11px] text-gray-500">Demo</span>
          </div>

          <div className="flex gap-2 px-3 py-3">
            {tabs.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setBookView(value)}
                className={`rounded border px-3 py-2 text-[11px] ${
                  bookView === value
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                    : 'border-[#2b3139] text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 px-3 pb-2">
            <span className="text-[11px] text-gray-500">Quantity display</span>
            <div className="flex gap-1">
              {[
                ['amount', 'Amount'],
                ['cumulative', 'Cumulative'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDisplayMode(value)}
                  aria-pressed={displayMode === value}
                  className={`rounded border px-2 py-1 text-[10px] ${
                    displayMode === value
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                      : 'border-[#2b3139] text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-3 pb-2">
            <span className="text-[11px] text-gray-500">Price grouping</span>
            <div className="flex gap-1">
              {[0.01, 0.1, 1, 10].map((precision) => (
                <button
                  key={precision}
                  type="button"
                  onClick={() => setPricePrecision(precision)}
                  aria-pressed={pricePrecision === precision}
                  className={`rounded border px-2 py-1 text-[10px] ${
                    pricePrecision === precision
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                      : 'border-[#2b3139] text-gray-400 hover:text-white'
                  }`}
                >
                  {precision}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 px-3 py-2 text-[11px] text-gray-500">
            <span>Price (USDT)</span>
            <span className="text-right">Amount (BTC)</span>
            <span className="text-right">Total (BTC)</span>
          </div>

          {(bookView === 'both' || bookView === 'sell') && (
            <OrderRows orders={asks} side="ask" displayMode={displayMode} pricePrecision={pricePrecision} />
          )}

          {bookView === 'both' && (
            <div className="flex flex-wrap items-center gap-2 border-y border-[#2b3139] px-3 py-3">
              <strong className="text-xl text-emerald-400">{midPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              <span className="text-[10px] text-gray-500">Mid price</span>
              <span className="ml-auto text-[10px] text-gray-500">
                Spread: {spread.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {(bookView === 'both' || bookView === 'buy') && (
            <OrderRows orders={bids} side="bid" displayMode={displayMode} pricePrecision={pricePrecision} />
          )}

          <div className="mt-2 flex justify-between border-t border-[#2b3139] px-3 py-3 text-[11px] text-gray-500">
            <span>Depth visualization</span>
            <span>Precision: {pricePrecision}</span>
          </div>
        </article>

        <RecentTrades />
      </section>

      <footer className="px-5 pb-6 pt-2 text-center text-[11px] text-gray-500">
        Demo interface · No real orders are placed · Market data is illustrative
      </footer>
    </main>
  )
}

export default App
