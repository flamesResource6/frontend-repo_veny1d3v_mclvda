import { useEffect, useMemo, useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

function Input({ label, value, onChange, type = 'text', min }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </label>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}

function App() {
  const [amount, setAmount] = useState('1')
  const [from, setFrom] = useState('OMR')
  const [to, setTo] = useState('USD')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currencies = useMemo(() => [
    'OMR','USD','EUR','GBP','INR','AED','SAR','QAR','BHD','KWD','JPY','CNY'
  ], [])

  useEffect(() => {
    // Auto-convert on initial load
    handleConvert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleConvert() {
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const url = `${BACKEND_URL}/api/convert?amount=${encodeURIComponent(amount || '0')}&from_currency=${from}&to_currency=${to}`
      const res = await fetch(url)
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.message || 'Conversion failed')
      }
      setResult(data)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function swap() {
    const f = from
    setFrom(to)
    setTo(f)
  }

  const parsedAmount = parseFloat(amount || '0')

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-white p-6">
        <h1 className="text-2xl font-bold text-gray-800">OMR to Dollar Converter</h1>
        <p className="text-gray-600 mb-6">Convert Omani Rial to US Dollar and more, using live exchange rates.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Amount" type="number" min={0} value={amount} onChange={setAmount} />
          <Select label="From" value={from} onChange={setFrom} options={currencies} />
          <Select label="To" value={to} onChange={setTo} options={currencies} />
          <div className="flex items-end">
            <button onClick={swap} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50">Swap</button>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleConvert}
            disabled={loading || !parsedAmount}
            className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Converting...' : 'Convert'}
          </button>
          {error && <div className="text-red-600 text-sm self-center">{error}</div>}
        </div>

        {result && (
          <div className="mt-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-gray-800 text-lg font-semibold">{result.amount} {result.from} =</div>
            <div className="text-3xl font-bold text-blue-700">{Number(result.result).toFixed(4)} {result.to}</div>
            <div className="mt-2 text-sm text-gray-500">Rate: 1 {result.from} = {result.rate} {result.to} ({result.source === 'live' ? 'Live' : 'Fallback'})</div>
          </div>
        )}

        <footer className="mt-8 text-xs text-gray-500">
          Tip: OMR is often fixed close to 2.600 USD.
        </footer>
      </div>
    </div>
  )
}

export default App
