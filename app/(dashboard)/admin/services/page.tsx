'use client'
import { useEffect, useState } from 'react'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Service {
  id: string
  name: string
  description: string
  price: number
  category: string
  icon?: string
  isActive: boolean
  deliveryDays: number
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', category: '', icon: '', deliveryDays: '7', features: ''
  })

  const fetchServices = () => {
    setLoading(true)
    const token = localStorage.getItem('access_token')
    fetch('/api/services?limit=50', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setServices(d.data.services) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchServices() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const token = localStorage.getItem('access_token')
    await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        deliveryDays: Number(form.deliveryDays),
        features: form.features.split('\n').filter(Boolean),
      }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ name: '', slug: '', description: '', price: '', category: '', icon: '', deliveryDays: '7', features: '' })
    fetchServices()
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    const token = localStorage.getItem('access_token')
    await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchServices()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Services</h1>
          <p className="text-white/50 text-sm mt-1">Manage platform services</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? 'Cancel' : '+ Add Service'}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">New Service</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Slug (URL)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
            <Input label="Price (₹)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
            <Input label="Icon (emoji)" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
            <Input label="Delivery Days" type="number" value={form.deliveryDays} onChange={e => setForm({ ...form, deliveryDays: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field h-24 resize-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Features (one per line)</label>
            <textarea
              value={form.features}
              onChange={e => setForm({ ...form, features: e.target.value })}
              className="input-field h-20 resize-none"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>
          <Button type="submit" loading={saving}>Create Service</Button>
        </form>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className={`bg-white/5 border rounded-2xl p-6 ${service.isActive ? 'border-white/10' : 'border-red-500/20 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{service.icon || '⚡'}</div>
                <span className={`text-xs px-2 py-1 rounded-full ${service.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{service.name}</h3>
              <p className="text-white/50 text-xs mb-3 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-bold">{formatCurrency(service.price)}</span>
                <button
                  onClick={() => toggleActive(service.id, service.isActive)}
                  className="text-xs text-white/50 hover:text-white transition-colors"
                >
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
