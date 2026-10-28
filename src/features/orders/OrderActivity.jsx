import { useState } from 'react'

const tabs = [
  { id: 'open', label: 'Open Orders' },
  { id: 'history', label: 'Order History' },
]

const columns = {
  open: ['Date', 'Pair', 'Type', 'Side', 'Price (USDT)', 'Amount (BTC)', 'Filled', 'Status'],
  history: ['Date', 'Pair', 'Type', 'Side', 'Price (USDT)', 'Amount (BTC)', 'Status'],
}

export default function OrderActivity() {
  const [activeTab, setActiveTab] = useState('open')

  return (
    <section className="px-2 pb-5">
      <article className="overflow-hidden rounded border border-[#2b3139] bg-[#161a1e]">
        <div className="flex flex-wrap items-center gap-5 border-b border-[#2b3139] px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={`border-b-2 py-4 text-xs font-medium ${
                activeTab === tab.id
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-gray-500">
            Demo · No real orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[11px]">
            <thead className="border-b border-[#2b3139] text-gray-500">
              <tr>
                {columns[activeTab].map((column) => (
                  <th key={column} className="whitespace-nowrap px-4 py-3 font-normal">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>

        <div className="flex min-h-36 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-sm text-gray-300">
            {activeTab === 'open' ? 'No open orders' : 'No order history yet'}
          </p>
          <p className="text-xs text-gray-500">
            Order records will be available after backend integration.
          </p>
        </div>
      </article>
    </section>
  )
}
