'use client'
import { useEffect, useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TableSkeleton } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  description: string
  createdAt: string
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0) // Pending commission
  const [paidOut, setPaidOut] = useState(0) // Total paid out
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [upiId, setUpiId] = useState('')
  const [savingUpi, setSavingUpi] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    Promise.all([
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/transactions', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([user, txData]) => {
      if (user.success) {
        // Pending commission is the current wallet balance
        setBalance(Number(user.data.walletBalance))
        setUpiId(user.data.upiId || '')
      }
      if (txData.success && txData.data) {
        setTransactions(txData.data)
        // Calculate total paid out from COMMISSION transactions
        const totalPaid = txData.data
          .filter((tx: Transaction) => tx.type === 'COMMISSION')
          .reduce((sum: number, tx: Transaction) => sum + Number(tx.amount), 0)
        setPaidOut(totalPaid)
      }
    }).finally(() => setLoading(false))
  }, [])

  const typeColors: Record<string, string> = {
    COMMISSION: 'text-green-400',
    WITHDRAWAL: 'text-red-400',
    BONUS: 'text-yellow-400',
    REFUND: 'text-blue-400',
  }

  const saveUpiId = async () => {
    if (!upiId.trim()) {
      alert('Please enter your UPI ID')
      return
    }

    // Basic UPI ID validation
    if (!upiId.includes('@')) {
      alert('Invalid UPI ID format. Should be like: username@bank')
      return
    }

    setSavingUpi(true)
    const token = localStorage.getItem('access_token')

    try {
      const res = await fetch('/api/users/update-upi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ upiId })
      })

      const data = await res.json()
      if (data.success) {
        alert('UPI ID saved successfully! Admin will use this for commission payments.')
        setShowWithdraw(false)
      } else {
        alert(data.message || 'Failed to save UPI ID')
      }
    } catch (error) {
      console.error('Error saving UPI ID:', error)
      alert('Failed to save UPI ID')
    } finally {
      setSavingUpi(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Wallet</h1>
        <p className="text-white/50 text-sm mt-1">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-purple-600/30 to-yellow-600/10 border border-purple-500/30 rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-white/60 text-sm mb-2">Pending Commission</p>
            <div className="text-4xl font-black text-yellow-400">{formatCurrency(balance)}</div>
            <p className="text-white/40 text-xs mt-1">Awaiting admin payment</p>
          </div>
          <div>
            <p className="text-white/60 text-sm mb-2">Paid Out</p>
            <div className="text-4xl font-black text-green-400">{formatCurrency(paidOut)}</div>
            <p className="text-white/40 text-xs mt-1">Total commissions paid to you</p>
          </div>
        </div>
        
        {upiId ? (
          <div className="mb-4">
            <p className="text-white/60 text-sm mb-1">Your UPI ID</p>
            <div className="flex items-center gap-2">
              <code className="text-purple-400 bg-purple-500/10 px-3 py-2 rounded text-sm">
                {upiId}
              </code>
              <Button onClick={() => setShowWithdraw(!showWithdraw)} variant="ghost" size="sm">
                Update
              </Button>
            </div>
            <p className="text-white/40 text-xs mt-2">
              Admin will transfer commissions to this UPI ID
            </p>
          </div>
        ) : (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              ⚠️ Please add your UPI ID to receive commission payments
            </p>
          </div>
        )}
        
        <Button onClick={() => setShowWithdraw(!showWithdraw)} variant="accent">
          {upiId ? 'Update UPI ID' : 'Add UPI ID'}
        </Button>
      </div>

      {/* UPI Form */}
      {showWithdraw && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            {upiId ? 'Update UPI ID' : 'Add UPI ID for Payments'}
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Enter your UPI ID to receive commission payments from admin. Format: username@bank (e.g., john@paytm, user@ybl)
          </p>
          <div className="max-w-md">
            <Input
              label="UPI ID"
              placeholder="username@bank"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <Button onClick={saveUpiId} disabled={savingUpi} size="sm">
                {savingUpi ? 'Saving...' : 'Save UPI ID'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowWithdraw(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Transaction History</h3>
        </div>

        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} /></div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💰</div>
            <p className="text-white/50">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${tx.type === 'COMMISSION' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {tx.type === 'COMMISSION' ? '↑' : '↓'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{tx.description}</div>
                    <div className="text-xs text-white/40">{formatDate(tx.createdAt)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${typeColors[tx.type] || 'text-white'}`}>
                    {tx.type === 'WITHDRAWAL' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </div>
                  <div className="text-xs text-white/40">{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
