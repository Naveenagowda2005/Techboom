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
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', bankAccount: '', ifscCode: '' })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    Promise.all([
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/transactions', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([user, txData]) => {
      if (user.success) setBalance(Number(user.data.walletBalance))
      if (txData.success && txData.data) {
        setTransactions(txData.data)
      }
    }).finally(() => setLoading(false))
  }, [])

  const typeColors: Record<string, string> = {
    COMMISSION: 'text-green-400',
    WITHDRAWAL: 'text-red-400',
    BONUS: 'text-yellow-400',
    REFUND: 'text-blue-400',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Wallet</h1>
        <p className="text-white/50 text-sm mt-1">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-purple-600/30 to-yellow-600/10 border border-purple-500/30 rounded-2xl p-8">
        <p className="text-white/60 text-sm mb-2">Available Balance</p>
        <div className="text-5xl font-black text-white mb-6">{formatCurrency(balance)}</div>
        <Button onClick={() => setShowWithdraw(!showWithdraw)} variant="accent">
          Withdraw Funds
        </Button>
      </div>

      {/* Withdraw Form */}
      {showWithdraw && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Withdraw Request</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              placeholder="Min ₹100"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
            />
            <Input
              label="Bank Account Number"
              placeholder="Account number"
              value={withdrawForm.bankAccount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, bankAccount: e.target.value })}
            />
            <Input
              label="IFSC Code"
              placeholder="SBIN0001234"
              value={withdrawForm.ifscCode}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, ifscCode: e.target.value })}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button size="sm">Submit Request</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowWithdraw(false)}>Cancel</Button>
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
