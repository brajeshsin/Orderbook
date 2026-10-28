import { useEffect, useRef, useState } from 'react'
import {
  AreaSeries,
  BarSeries,
  CandlestickSeries,
  createChart,
  LineSeries,
} from 'lightweight-charts'

const chartTypes = [
  { id: 'candles', label: 'Candles', series: CandlestickSeries },
  { id: 'line', label: 'Line', series: LineSeries },
  { id: 'bars', label: 'Bars', series: BarSeries },
  { id: 'area', label: 'Area', series: AreaSeries },
]

function toApiInterval(timeframe) {
  return timeframe === '1M' ? '1M' : timeframe.toLowerCase()
}

function parseKlines(rows) {
  return rows.map((row) => ({
    time: Math.floor(row[0] / 1000),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
  }))
}

const MAX_CANDLES = 5000
const API_BATCH_SIZE = 1000
const ALL_HISTORY_START = Date.UTC(2017, 7, 17)

const intervalMilliseconds = {
  '1s': 1000,
  '1m': 60_000,
  '3m': 180_000,
  '5m': 300_000,
  '15m': 900_000,
  '30m': 1_800_000,
  '1h': 3_600_000,
  '2h': 7_200_000,
  '4h': 14_400_000,
  '6h': 21_600_000,
  '8h': 28_800_000,
  '12h': 43_200_000,
  '1d': 86_400_000,
  '3d': 259_200_000,
  '1w': 604_800_000,
  '1M': 30 * 86_400_000,
}

function getRangeStart(range, now) {
  const start = new Date(now)

  if (range === '3M') {
    start.setUTCMonth(start.getUTCMonth() - 3)
    return start.getTime()
  }

  if (range === '6M') {
    start.setUTCMonth(start.getUTCMonth() - 6)
    return start.getTime()
  }

  if (range === '1Y') {
    start.setUTCFullYear(start.getUTCFullYear() - 1)
    return start.getTime()
  }

  return ALL_HISTORY_START
}

function getSeriesOptions(type) {
  if (type === 'candles') {
    return {
      upColor: '#0ecb81',
      downColor: '#f6465d',
      borderUpColor: '#0ecb81',
      borderDownColor: '#f6465d',
      wickUpColor: '#0ecb81',
      wickDownColor: '#f6465d',
    }
  }

  if (type === 'bars') {
    return {
      upColor: '#0ecb81',
      downColor: '#f6465d',
      openVisible: true,
      thinBars: false,
    }
  }

  if (type === 'area') {
    return {
      lineColor: '#0ecb81',
      topColor: 'rgba(14, 203, 129, 0.35)',
      bottomColor: 'rgba(14, 203, 129, 0.02)',
      lineWidth: 2,
    }
  }

  return {
    color: '#d946ef',
    lineWidth: 2,
  }
}

export default function MarketChart({ timeframe = '1D', range = 'All' }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const candlesRef = useRef([])
  const rangeStartRef = useRef(ALL_HISTORY_START)
  const loadingOlderRef = useRef(false)
  const hasMoreHistoryRef = useRef(true)
  const pendingLogicalRangeRef = useRef(null)
  const [candles, setCandles] = useState([])
  const [dataError, setDataError] = useState('')
  const [loading, setLoading] = useState(false)
  const [chartType, setChartType] = useState('candles')
  const [menuOpen, setMenuOpen] = useState(false)

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

    chartRef.current = chart

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
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadCandles() {
      setDataError('')
      setLoading(true)
      setCandles([])
      candlesRef.current = []
      loadingOlderRef.current = false
      hasMoreHistoryRef.current = true
      pendingLogicalRangeRef.current = null

      try {
        const interval = toApiInterval(timeframe)
        if (!intervalMilliseconds[interval]) {
          throw new Error(`Unsupported chart interval: ${timeframe}`)
        }

        const now = Date.now()
        const startTime = getRangeStart(range, now)
        rangeStartRef.current = startTime
        const url = new URL('https://api.binance.com/api/v3/klines')
        url.searchParams.set('symbol', 'BTCUSDT')
        url.searchParams.set('interval', interval)
        url.searchParams.set('endTime', String(now))
        url.searchParams.set('limit', '500')

        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Binance API request failed (${response.status})`)
        }

        const rows = await response.json()
        if (!Array.isArray(rows)) {
          throw new Error('Unexpected Binance candle response')
        }

        const parsed = parseKlines(rows).filter(
          (candle) => candle.time * 1000 >= startTime,
        )

        candlesRef.current = parsed
        setCandles(parsed)

        if (parsed.length === 0) {
          setDataError('No candles found in the selected range.')
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setDataError(error.message || 'Unable to load Binance candles')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadCandles()
    return () => controller.abort()
  }, [timeframe, range])

  useEffect(() => {
    if (loading || dataError || candlesRef.current.length === 0) return

    let socket
    let reconnectTimer
    let reconnectDelay = 1000
    let disposed = false

    const interval = toApiInterval(timeframe)
    const streamUrl = `wss://stream.binance.com:9443/ws/btcusdt@kline_${interval}`

    function connect() {
      if (disposed) return

      socket = new WebSocket(streamUrl)

      socket.onopen = () => {
        reconnectDelay = 1000
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          const kline = message.k

          if (!kline) return

          const candle = {
            time: Math.floor(kline.t / 1000),
            open: Number(kline.o),
            high: Number(kline.h),
            low: Number(kline.l),
            close: Number(kline.c),
          }

          const currentCandles = candlesRef.current
          const lastCandle = currentCandles[currentCandles.length - 1]

          if (lastCandle && candle.time < lastCandle.time) return

          if (lastCandle && candle.time === lastCandle.time) {
            currentCandles[currentCandles.length - 1] = candle
          } else {
            currentCandles.push(candle)

            if (currentCandles.length > MAX_CANDLES) {
              currentCandles.shift()
            }
          }

          const series = seriesRef.current
          if (series) {
            const point =
              chartType === 'line' || chartType === 'area'
                ? { time: candle.time, value: candle.close }
                : candle

            series.update(point)
          }
        } catch {
          // Ignore malformed WebSocket messages and keep the stream alive.
        }
      }

      socket.onclose = () => {
        if (disposed) return

        reconnectTimer = setTimeout(connect, reconnectDelay)
        reconnectDelay = Math.min(reconnectDelay * 2, 30000)
      }

      socket.onerror = () => {
        socket?.close()
      }
    }

    connect()

    return () => {
      disposed = true
      clearTimeout(reconnectTimer)

      if (socket) {
        socket.onopen = null
        socket.onmessage = null
        socket.onerror = null
        socket.onclose = null
        socket.close()
      }
    }
  }, [timeframe, range, loading, dataError, chartType])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current)
    }

    const selectedType = chartTypes.find((type) => type.id === chartType)
    const series = chart.addSeries(
      selectedType.series,
      getSeriesOptions(chartType),
    )

    seriesRef.current = series

    return () => {
      if (seriesRef.current !== series) return

      seriesRef.current = null

      if (chartRef.current === chart) {
        chart.removeSeries(series)
      }
    }
  }, [chartType])

  useEffect(() => {
    const series = seriesRef.current
    if (!series) return

    const data =
      chartType === 'line' || chartType === 'area'
        ? candles.map(({ time, close }) => ({ time, value: close }))
        : candles

    series.setData(data)

    const pendingRange = pendingLogicalRangeRef.current
    if (pendingRange) {
      chartRef.current?.timeScale().setVisibleLogicalRange(pendingRange)
      pendingLogicalRangeRef.current = null
    }
  }, [candles, chartType])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart || loading || dataError || candlesRef.current.length === 0) {
      return
    }

    let disposed = false
    const timeScale = chart.timeScale()

    async function loadOlderCandles() {
      const currentCandles = candlesRef.current

      if (
        disposed ||
        loadingOlderRef.current ||
        !hasMoreHistoryRef.current ||
        currentCandles.length === 0 ||
        currentCandles.length >= MAX_CANDLES
      ) {
        if (currentCandles.length >= MAX_CANDLES) {
          hasMoreHistoryRef.current = false
        }
        return
      }

      loadingOlderRef.current = true

      try {
        const interval = toApiInterval(timeframe)
        const oldestTime = currentCandles[0].time * 1000

        if (oldestTime <= rangeStartRef.current) {
          hasMoreHistoryRef.current = false
          return
        }

        const url = new URL('https://api.binance.com/api/v3/klines')
        url.searchParams.set('symbol', 'BTCUSDT')
        url.searchParams.set('interval', interval)
        url.searchParams.set('endTime', String(oldestTime - 1))
        url.searchParams.set('limit', String(API_BATCH_SIZE))

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Binance history request failed (${response.status})`)
        }

        const rows = await response.json()
        if (!Array.isArray(rows)) {
          throw new Error('Unexpected Binance history response')
        }

        if (disposed) return

        const existingTimes = new Set(
          candlesRef.current.map((candle) => candle.time),
        )

        const olderCandles = parseKlines(rows).filter(
          (candle) =>
            candle.time * 1000 >= rangeStartRef.current &&
            candle.time < candlesRef.current[0].time &&
            !existingTimes.has(candle.time),
        )

        if (rows.length < API_BATCH_SIZE) {
          hasMoreHistoryRef.current = false
        }

        if (olderCandles.length === 0) {
          hasMoreHistoryRef.current = false
          return
        }

        const latestVisibleRange = timeScale.getVisibleLogicalRange()
        const availableSlots = MAX_CANDLES - candlesRef.current.length
        const acceptedOlderCandles = olderCandles.slice(-availableSlots)

        if (acceptedOlderCandles.length === 0) {
          hasMoreHistoryRef.current = false
          return
        }

        if (latestVisibleRange) {
          pendingLogicalRangeRef.current = {
            from: latestVisibleRange.from + acceptedOlderCandles.length,
            to: latestVisibleRange.to + acceptedOlderCandles.length,
          }
        }

        const mergedCandles = [
          ...acceptedOlderCandles,
          ...candlesRef.current,
        ]

        candlesRef.current = mergedCandles
        setCandles(mergedCandles)

        if (mergedCandles.length >= MAX_CANDLES) {
          hasMoreHistoryRef.current = false
        }

        const earliestLoaded = mergedCandles[0]?.time * 1000
        if (earliestLoaded <= rangeStartRef.current) {
          hasMoreHistoryRef.current = false
        }
      } catch (error) {
        if (!disposed) {
          console.error('Unable to load older Binance candles:', error)
        }
      } finally {
        loadingOlderRef.current = false
      }
    }

    function handleVisibleRangeChange(logicalRange) {
      if (logicalRange && logicalRange.from < 10) {
        void loadOlderCandles()
      }
    }

    timeScale.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange)

    return () => {
      disposed = true
      timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange)
    }
  }, [timeframe, range, loading, dataError])

  return (
    <div className="relative">
      <div className="flex h-10 items-center gap-3 border-b border-[#2b3139] px-3 text-xs">
        <span className="text-gray-500">Chart type</span>

        <div className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded px-2 py-1.5 text-gray-200 hover:bg-white/[0.06]"
          >
            <span>{chartTypes.find((type) => type.id === chartType).label}</span>
            <span className="text-gray-500">▾</span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="Chart type"
              className="absolute left-0 top-full z-20 mt-1 min-w-36 rounded border border-[#2b3139] bg-[#1e2329] p-1 shadow-xl"
            >
              {chartTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={chartType === type.id}
                  onClick={() => {
                    setChartType(type.id)
                    setMenuOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-4 rounded px-3 py-2.5 text-left hover:bg-white/[0.06]"
                >
                  <span>{type.label}</span>
                  <span className="w-4 text-center text-yellow-400">
                    {chartType === type.id ? '✓' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div role="status" className="px-4 py-2 text-xs text-gray-400">
          Loading historical candles…
        </div>
      )}

      {dataError && (
        <div role="status" className="px-4 py-2 text-xs text-rose-400">
          Binance chart data unavailable: {dataError}
        </div>
      )}

      <div
        ref={containerRef}
        className="h-[320px] w-full sm:h-[420px]"
      />

      <div className="border-t border-[#2b3139] px-4 py-2 text-[11px] text-gray-500">
        Historical candles from Binance Spot API · Live BTCUSDT kline stream
      </div>
    </div>
  )
}
