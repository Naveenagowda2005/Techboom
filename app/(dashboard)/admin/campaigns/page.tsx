'use client'
import { useEffect, useState } from 'react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Campaign {
  id: string
  title: string
  description: string
  budget: number
  platform: string[]
  status: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  user: {
    name: string
    email: string
  }
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    platform: [] as string[],
    status: 'DRAFT',
    startDate: '',
    endDate: ''
  })

  const fetchCampaigns = async () => {
    setLoading(true)
    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch('/api/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setCampaigns(data.data.campaigns)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const openAddModal = () => {
    setEditingCampaign(null)
    setFormData({
      title: '',
      description: '',
      budget: '',
      platform: [],
      status: 'DRAFT',
      startDate: '',
      endDate: ''
    })
    setShowModal(true)
  }

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setFormData({
      title: campaign.title,
      description: campaign.description,
      budget: campaign.budget.toString(),
      platform: campaign.platform,
      status: campaign.status,
      startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const token = localStorage.getItem('access_token')
    const url = editingCampaign ? `/api/campaigns/${editingCampaign.id}` : '/api/campaigns'
    const method = editingCampaign ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget),
          startDate: formData.startDate || null,
          endDate: formData.endDate || null
        })
      })

      if (res.ok) {
        setShowModal(false)
        setEditingCampaign(null)
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Error saving campaign:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    const token = localStorage.getItem('access_token')
    try {
      await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platform: prev.platform.includes(platform)
        ? prev.platform.filter(p => p !== platform)
        : [...prev.platform, platform]
    }))
  }

  const platforms = ['Instagram', 'YouTube', 'Facebook', 'Twitter', 'TikTok', 'LinkedIn']
  const statuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Campaigns</h1>
          <p className="text-white/50 text-sm mt-1">Manage influencer campaigns</p>
        </div>
        <Button onClick={openAddModal} size="sm">
          + Add Campaign
        </Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">No Campaigns Yet</h3>
            <p className="text-white/50 mb-4">Start by creating your first influencer campaign</p>
            <button onClick={openAddModal} className="btn-primary">
              + Add Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/40">
                  <th className="px-6 py-4 font-medium">Campaign</th>
                  <th className="px-6 py-4 font-medium">Creator</th>
                  <th className="px-6 py-4 font-medium">Budget</th>
                  <th className="px-6 py-4 font-medium">Platforms</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="text-sm hover:bg-white/3">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{campaign.title}</div>
                      <div className="text-white/40 text-xs line-clamp-1">
                        {campaign.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{campaign.user.name}</div>
                      <div className="text-white/40 text-xs">{campaign.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-yellow-400 font-semibold">
                        {formatCurrency(campaign.budget)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {campaign.platform.map((p) => (
                          <span
                            key={p}
                            className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          campaign.status === 'ACTIVE'
                            ? 'bg-green-500/20 text-green-400'
                            : campaign.status === 'COMPLETED'
                            ? 'bg-blue-500/20 text-blue-400'
                            : campaign.status === 'PAUSED'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-xs">
                      {campaign.startDate && campaign.endDate ? (
                        <div>
                          <div>{formatDate(campaign.startDate)}</div>
                          <div>to {formatDate(campaign.endDate)}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(campaign)}
                          className="text-purple-400 hover:text-purple-300 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1333] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Campaign Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field h-24 resize-none"
                  required
                />
              </div>
              <Input
                label="Budget (₹)"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        formData.platform.includes(platform)
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-500'
                          : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field [&>option]:bg-gray-900 [&>option]:text-white"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" loading={saving}>
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
