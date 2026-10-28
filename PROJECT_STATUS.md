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
- Candlestick chart currently uses illustrative/demo data.
- Order book currently uses hardcoded demo asks and bids.
- Order book has Both sides / Buy / Sell view filters.
- Amount / Cumulative display mode controls depth bars.
- Price grouping selector supports 0.01, 0.1, 1, and 10.
- Recent Trades currently uses demo data.
- No real order placement or matching engine exists yet.

## Current development state
- Order-entry state variables were added to `src/App.jsx`:
  - `orderSide`
  - `orderType`
  - `orderPrice`
  - `orderQuantity`
- These variables are not yet connected to UI. Latest lint run reported 8 unused-variable warnings.
- Next task: implement the demo-only Buy/Sell order-entry UI using these states, then run `npm run build && npm run lint` and resolve all warnings.
- After order entry, continue frontend work such as open orders, order history, and balances before backend/matching-engine work.

## Important implementation notes
- Binance ticker stream is not our matching engine and does not execute our orders.
- Keep public market data separate from our future local order book and matching engine.
- Clearly label demo data; do not imply that demo orders are real.
- Inspect relevant source code before editing.
- Make one small change at a time.
- Back up files before command-based edits.
- After each change, run `npm run build && npm run lint` and inspect the result.
- Avoid broad replacements or changes to unrelated files.
- Do not run `git add .` until `.gitignore` and the staged file list have been reviewed.

## Git
- Project repository root: `~/orderbook_binance`
- Branch: `main`
- Initial commit has not been created yet.

## Resume instructions for a new chat
1. Read this file first.
2. Run `git status --short --branch`.
3. Inspect the relevant code before changing it.
4. Resume with the next task listed under Current development state.
