import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'

function createDemoCandles() {
  const candles = []
  let price = 66800

  for (let i = 0; i < 100; i++) {
    const open = price
    const change = (Math.random() - 0.46) * 180
    const close = open + change

    candles.push({
      time: Math.floor(Date.UTC(2026, 9, 20 + i) / 1000),
      open: Number(open.toFixed(2)),
      high: Number((Math.max(open, close) + Math.random() * 75).toFixed(2)),
      low: Number((Math.min(open, close) - Math.random() * 75).toFixed(2)),
      close: Number(close.toFixed(2)),
    })

    price = close
  }

  return candles
}

export default function MarketChart() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: '#161a1e' },
        textColor: '#848e9c',
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#22272e' },
        horzLines: { color: '#22272e' },
      },
      rightPriceScale: {
        borderColor: '#2b3139',
      },
      timeScale: {
        borderColor: '#2b3139',
        timeVisible: false,
      },
      crosshair: {
        vertLine: { color: '#75808a', labelBackgroundColor: '#474d57' },
        horzLine: { color: '#75808a', labelBackgroundColor: '#474d57' },
      },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#0ecb81',
      downColor: '#f6465d',
      borderUpColor: '#0ecb81',
      borderDownColor: '#f6465d',
      wickUpColor: '#0ecb81',
      wickDownColor: '#f6465d',
    })

    series.setData(createDemoCandles())
    chart.timeScale().fitContent()

    const observer = new ResizeObserver(() => {
      chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      })
    })

    observer.observe(container)

    return () => {
      observer.disconnect()
      chart.remove()
    }
  }, [])

  return <div ref={containerRef} className="h-[360px] w-full sm:h-[460px]" />
}
