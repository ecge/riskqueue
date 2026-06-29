import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Banknote,
  CheckCircle2,
  FileSearch,
  Gauge,
  Search,
  ShieldAlert,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react'
import './App.css'

type ReviewStatus = 'New' | 'Escalated' | 'Approved' | 'Blocked'

type Transaction = {
  id: string
  merchant: string
  customer: string
  amount: number
  location: string
  device: string
  score: number
  status: ReviewStatus
  reasons: string[]
}

const seedTransactions: Transaction[] = [
  {
    id: 'TX-88421',
    merchant: 'Cobalt Gadgets',
    customer: 'Leah M.',
    amount: 1840,
    location: 'Berlin, DE',
    device: 'New Android device',
    score: 91,
    status: 'Escalated',
    reasons: ['First purchase over threshold', 'Device changed this session', 'Card velocity spike'],
  },
  {
    id: 'TX-88422',
    merchant: 'North Pier Books',
    customer: 'Omar K.',
    amount: 78,
    location: 'Boston, US',
    device: 'Known iPhone',
    score: 18,
    status: 'Approved',
    reasons: ['Known device', 'Low value order', 'Normal buying pattern'],
  },
  {
    id: 'TX-88423',
    merchant: 'Vector Travel',
    customer: 'Mina S.',
    amount: 2320,
    location: 'Lima, PE',
    device: 'Unrecognized browser',
    score: 84,
    status: 'New',
    reasons: ['Geo jump under two hours', 'High value travel spend', 'No saved device match'],
  },
  {
    id: 'TX-88424',
    merchant: 'Metro Parts',
    customer: 'Sam R.',
    amount: 460,
    location: 'Austin, US',
    device: 'Known desktop',
    score: 66,
    status: 'New',
    reasons: ['Unusual category', 'Billing address recently changed', 'Medium value order'],
  },
]

const filters = ['All', 'New', 'Escalated', 'Approved', 'Blocked'] as const
type Filter = (typeof filters)[number]

const currency = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
})

const theme = {
  '--accent': '#be123c',
  '--accent-2': '#0f766e',
  '--accent-3': '#f59e0b',
} as CSSProperties

function getStatusClass(status: ReviewStatus) {
  if (status === 'Approved') return 'good'
  if (status === 'Blocked') return 'bad'
  if (status === 'Escalated') return 'warn'
  return 'info'
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Severe'
  if (score >= 65) return 'Elevated'
  if (score >= 35) return 'Watch'
  return 'Low'
}

function App() {
  const [transactions, setTransactions] = useState(seedTransactions)
  const [selectedId, setSelectedId] = useState(seedTransactions[0].id)
  const [filter, setFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const selected =
    transactions.find((transaction) => transaction.id === selectedId) ?? transactions[0]

  const visibleTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()
    return transactions.filter((transaction) => {
      const matchesFilter = filter === 'All' || transaction.status === filter
      const matchesSearch =
        !query ||
        [
          transaction.id,
          transaction.merchant,
          transaction.customer,
          transaction.location,
          transaction.device,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)

      return matchesFilter && matchesSearch
    })
  }, [filter, search, transactions])

  const queueCount = transactions.filter(
    (transaction) => transaction.status === 'New' || transaction.status === 'Escalated',
  ).length
  const blockedValue = transactions
    .filter((transaction) => transaction.status === 'Blocked')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const averageScore = Math.round(
    transactions.reduce((sum, transaction) => sum + transaction.score, 0) /
      transactions.length,
  )

  function updateSelected(status: ReviewStatus) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === selected.id ? { ...transaction, status } : transaction,
      ),
    )
  }

  return (
    <main className="app" style={theme}>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">
              <ShieldAlert size={22} aria-hidden="true" />
            </span>
            <div>
              <h1>RiskQueue</h1>
              <p>Fraud review and decision desk</p>
            </div>
          </div>
          <div className="toolbar">
            <button className="icon-button" type="button" aria-label="Upload batch">
              <Upload size={18} aria-hidden="true" />
            </button>
            <button className="ghost-button" type="button">
              <FileSearch size={17} aria-hidden="true" />
              Case notes
            </button>
            <button className="action-button" type="button">
              <ShieldCheck size={17} aria-hidden="true" />
              Review queue
            </button>
          </div>
        </header>

        <section className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Risk operations</p>
            <h2>Score suspicious transactions, explain the signal, and record decisions.</h2>
            <p>
              RiskQueue turns a fraud model into an analyst workflow with transaction
              search, score context, factor review, and decision controls.
            </p>
          </div>
          <aside className="command-stack" aria-label="Risk actions">
            <button className="action-button" type="button" onClick={() => updateSelected('Approved')}>
              <CheckCircle2 size={17} aria-hidden="true" />
              Approve selected
            </button>
            <button className="ghost-button" type="button" onClick={() => updateSelected('Blocked')}>
              <XCircle size={17} aria-hidden="true" />
              Block selected
            </button>
            <button className="ghost-button" type="button" onClick={() => updateSelected('Escalated')}>
              <AlertTriangle size={17} aria-hidden="true" />
              Escalate case
            </button>
          </aside>
        </section>

        <section className="stats-grid" aria-label="Fraud summary">
          <article className="metric">
            <span className="metric-icon">
              <Activity size={19} aria-hidden="true" />
            </span>
            <h3>{queueCount}</h3>
            <p>Open reviews</p>
          </article>
          <article className="metric">
            <span className="metric-icon">
              <Gauge size={19} aria-hidden="true" />
            </span>
            <h3>{averageScore}</h3>
            <p>Average risk score</p>
          </article>
          <article className="metric">
            <span className="metric-icon">
              <Banknote size={19} aria-hidden="true" />
            </span>
            <h3>{currency.format(blockedValue)}</h3>
            <p>Blocked value</p>
          </article>
          <article className="metric">
            <span className="metric-icon">
              <ShieldCheck size={19} aria-hidden="true" />
            </span>
            <h3>4.2m</h3>
            <p>Median review time</p>
          </article>
        </section>

        <section className="workspace-grid">
          <div className="panel">
            <div className="panel-title">
              <div>
                <h2>Transaction queue</h2>
                <p>Search, filter, and open analyst decisions.</p>
              </div>
            </div>
            <div className="search-row">
              <label className="search-box">
                <Search size={17} aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transactions"
                />
              </label>
            </div>
            <div className="filter-row" aria-label="Transaction filters">
              {filters.map((item) => (
                <button
                  className={`filter-pill ${filter === item ? 'active' : ''}`}
                  key={item}
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Customer</th>
                    <th>Location</th>
                    <th>Amount</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <button
                          className="row-button"
                          type="button"
                          onClick={() => setSelectedId(transaction.id)}
                        >
                          <span className="strong">{transaction.id}</span>
                          <br />
                          <span className="muted">{transaction.merchant}</span>
                        </button>
                      </td>
                      <td>{transaction.customer}</td>
                      <td>{transaction.location}</td>
                      <td>{currency.format(transaction.amount)}</td>
                      <td>{transaction.score}</td>
                      <td>
                        <span className={`status ${getStatusClass(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="panel">
            <div className="panel-title">
              <div>
                <h2>{selected.id}</h2>
                <p>{selected.merchant}</p>
              </div>
              <span className={`status ${getStatusClass(selected.status)}`}>
                {selected.status}
              </span>
            </div>
            <div className="detail-stack">
              <div className="mini-grid">
                <div className="mini-stat">
                  <p>Risk score</p>
                  <strong>{selected.score}</strong>
                </div>
                <div className="mini-stat">
                  <p>Risk band</p>
                  <strong>{scoreLabel(selected.score)}</strong>
                </div>
              </div>
              <div className="detail-row">
                <span className="muted">Score strength</span>
                <div className="progress" aria-label={`${selected.score} percent risk score`}>
                  <span style={{ width: `${selected.score}%` }} />
                </div>
              </div>
              <div className="detail-row">
                <span className="muted">Customer context</span>
                <span className="strong">{selected.customer}</span>
                <span>{selected.location}</span>
                <span>{selected.device}</span>
              </div>
              <div className="detail-row">
                <span className="muted">Model factors</span>
                {selected.reasons.map((reason) => (
                  <span className="split-row" key={reason}>
                    {reason}
                    <AlertTriangle size={16} aria-hidden="true" />
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}

export default App
