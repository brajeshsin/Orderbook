# Orderbook Binance — Project Status

## Project goal
Build a Binance-style BTC/USDT spot-trading frontend first, then implement a backend and matching engine.

## Working directory
`~/orderbook_binance`

## Stack
- React
- Vite
- Tailwind CSS
- oxlint
- Binance public WebSocket ticker stream

## Current frontend
- BTC/USDT market summary uses Binance ticker WebSocket data.
- Candlestick chart uses illustrative/demo data.
- Order book uses hardcoded demo asks and bids.
- Order book supports Both sides / Buy / Sell filters.
- Amount / Cumulative display mode controls depth bars.
- Price grouping selector supports 0.01, 0.1, 1, and 10.
- Recent Trades uses demo data.
- Demo Order Entry panel is implemented.
- Buy BTC / Sell BTC selection is available.
- Limit / Market order type selection is available.
- Limit price and BTC quantity inputs are available.
- Estimated order total is displayed in USDT.
- Order submission is demo-only; no real orders are placed.
- Backend, matching engine, balances, and real order history are not connected.

## Data and calculation notes
- Binance public WebSocket supplies ticker data, not our own order book.
- Market order estimate uses ticker price and does not represent executable order-book liquidity.
- Order book, candlestick chart, and recent trades are currently demo data.
- Market estimate should be checked when ticker data is unavailable; it must not show a misleading zero estimate.

## Current development state
- Order-entry UI has been added to `src/App.jsx`.
- Latest reported `npm run build && npm run lint` passed; lint reported 0 warnings and 0 errors.
- Latest diff review found the order-entry panel addition in `src/App.jsx`.
- Next: verify the UI in the browser, fix any visible issues, then commit and push the reviewed changes.
- After that, continue frontend features such as Open Orders, Order History, and balances before backend/matching-engine work.

## Important implementation notes
- Binance ticker data does not execute our orders.
- Keep public market data separate from our future local order book and matching engine.
- Clearly label demo data; never imply demo orders are real.
- Inspect relevant source code before editing.
- Make one small change at a time.
- Back up files before command-based edits.
- After each code change, run `npm run build && npm run lint` and inspect the result.
- Avoid broad replacements or changes to unrelated files.
- Review the staged file list before committing; do not use `git add .` blindly.

## Git
- Project repository root: `~/orderbook_binance`
- Branch: `main`
- Remote: `origin` (`https://github.com/brajeshsin/Orderbook.git`)
- Baseline and remote-history merge commits have been pushed.
- The latest order-entry change in `src/App.jsx` is not yet committed.
- Stage only reviewed files, inspect the staged diff, then commit and push to `origin/main`.

## Resume instructions for a new chat
1. Read this file first.
2. Run `git status --short --branch`.
3. Inspect relevant source and the current diff before changing code.
4. Follow the one-small-change-at-a-time workflow.
5. Resume with the next task listed under Current development state.
