'use client'
import { useEffect, useState } from 'react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'

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
  isJoined: boolean
  participantStatus: string | null
  totalParticipants: number
}

interface MyCampaign {
  id: string
  status: string
  joinedAt: string
  earnings: number
  referrals: number
  campaign: Campaign
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'my-campaigns'>('available')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [myCampaigns, setMyCampaigns] = useState<MyCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const fetchAvailableCampaigns = async () => {
    setLoading(true)
    const token = localStorage.getItem('access_token')
    try {
      const url = selectedPlatform 
        ? `/api/campaigns/available?platform=${selectedPlatform}`
        : '/api/campaigns/available'
      
      const res = await fetch(url, {
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

  const fetchMyCampaigns = async () => {
    setLoading(true)
    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch('/api/campaigns/my-campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setMyCampaigns(data.data.participations)
      }
    } catch (error) {
      console.error('Error fetching my campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'available') {
      fetchAvailableCampaigns()
    } else {
      fetchMyCampaigns()
    }
  }, [activeTab, selectedPlatform])

  const handleJoinCampaign = async (campaignId: string) => {
    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Successfully joined campaign!')
        fetchAvailableCampaigns()
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error('Error joining campaign:', error)
      alert('Failed to join campaign')
    }
  }

  const handleLeaveCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to leave this campaign?')) return

    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Successfully left campaign')
        fetchAvailableCampaigns()
        fetchMyCampaigns()
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error('Error leaving campaign:', error)
      alert('Failed to leave campaign')
    }
  }

  const platforms = ['Instagram', 'YouTube', 'Facebook', 'Twitter', 'TikTok', 'LinkedIn']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Campaigns</h1>
        <p className="text-white/50 text-sm mt-1">Browse and join influencer campaigns</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'available'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Available Campaigns
        </button>
        <button
          onClick={() => setActiveTab('my-campaigns')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'my-campaigns'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-white/50 hover:text-white'
          }`}
        >
          My Campaigns
        </button>
      </div>

      {/* Platform Filter (only for available campaigns) */}
      {activeTab === 'available' && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPlatform('')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedPlatform === ''
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
            }`}
          >
            All Platforms
          </button>
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedPlatform === platform
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      )}

      {/* Available Campaigns */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full">
              <TableSkeleton rows={3} />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-full bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">No Campaigns Available</h3>
              <p className="text-white/50">Check back later for new campaigns</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{campaign.title}</h3>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-lg">
                    {campaign.status}
                  </span>
                </div>

                <p className="text-white/60 text-sm mb-4 line-clamp-2">
                  {campaign.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Budget:</span>
                    <span className="text-yellow-400 font-semibold">
                      {formatCurrency(campaign.budget)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Participants:</span>
                    <span className="text-white">{campaign.totalParticipants}</span>
                  </div>
                  {campaign.startDate && campaign.endDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">Duration:</span>
                      <span className="text-white/60 text-xs">
                        {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {campaign.platform.map((p) => (
                    <span
                      key={p}
                      className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCampaign(campaign)
                      setShowDetailsModal(true)
                    }}
                    className="flex-1 px-4 py-2 text-sm text-white/70 hover:text-white border border-white/10 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                  {campaign.isJoined ? (
                    campaign.participantStatus === 'ACTIVE' ? (
                      <button
                        onClick={() => handleLeaveCampaign(campaign.id)}
                        className="flex-1 px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 text-sm bg-gray-500/20 text-gray-400 rounded-lg cursor-not-allowed"
                      >
                        {campaign.participantStatus}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleJoinCampaign(campaign.id)}
                      className="flex-1 px-4 py-2 text-sm bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors"
                    >
                      Join Campaign
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* My Campaigns */}
      {activeTab === 'my-campaigns' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : myCampaigns.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-white mb-2">No Campaigns Yet</h3>
              <p className="text-white/50 mb-4">Join campaigns to start earning</p>
              <button
                onClick={() => setActiveTab('available')}
                className="btn-primary"
              >
                Browse Campaigns
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr className="text-left text-xs text-white/40">
                    <th className="px-6 py-4 font-medium">Campaign</th>
                    <th className="px-6 py-4 font-medium">Platforms</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                    <th className="px-6 py-4 font-medium">Referrals</th>
                    <th className="px-6 py-4 font-medium">Earnings</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {myCampaigns.map((participation) => (
                    <tr key={participation.id} className="text-sm hover:bg-white/3">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {participation.campaign.title}
                        </div>
                        <div className="text-white/40 text-xs line-clamp-1">
                          {participation.campaign.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {participation.campaign.platform.map((p) => (
                            <span
                              key={p}
                              className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-xs">
                        {formatDate(participation.joinedAt)}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {participation.referrals}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-yellow-400 font-semibold">
                          {formatCurrency(participation.earnings)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            participation.status === 'ACTIVE'
                              ? 'bg-green-500/20 text-green-400'
                              : participation.status === 'COMPLETED'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {participation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {participation.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleLeaveCampaign(participation.campaign.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Leave
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Campaign Details Modal */}
      {showDetailsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1333] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{selectedCampaign.title}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/50">Description</label>
                <p className="text-white mt-1">{selectedCampaign.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/50">Budget</label>
                  <p className="text-yellow-400 font-semibold text-lg mt-1">
                    {formatCurrency(selectedCampaign.budget)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-white/50">Participants</label>
                  <p className="text-white text-lg mt-1">{selectedCampaign.totalParticipants}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/50">Platforms</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedCampaign.platform.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {selectedCampaign.startDate && selectedCampaign.endDate && (
                <div>
                  <label className="text-sm text-white/50">Campaign Duration</label>
                  <p className="text-white mt-1">
                    {formatDate(selectedCampaign.startDate)} - {formatDate(selectedCampaign.endDate)}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedCampaign.isJoined ? (
                  selectedCampaign.participantStatus === 'ACTIVE' ? (
                    <Button
                      onClick={() => {
                        handleLeaveCampaign(selectedCampaign.id)
                        setShowDetailsModal(false)
                      }}
                      variant="secondary"
                    >
                      Leave Campaign
                    </Button>
                  ) : (
                    <Button disabled>
                      {selectedCampaign.participantStatus}
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() => {
                      handleJoinCampaign(selectedCampaign.id)
                      setShowDetailsModal(false)
                    }}
                  >
                    Join Campaign
                  </Button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
