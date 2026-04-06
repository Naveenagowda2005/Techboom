'use client'
// Version: 2.0 - Fixed button handlers
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
  image?: string
  isActive: boolean
  deliveryDays: number
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategory, setCustomCategory] = useState('')
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '', image: '', deliveryDays: '7', features: ''
  })

  const fetchServices = () => {
    setLoading(true)
    const token = localStorage.getItem('access_token')
    fetch('/api/services?limit=50&showAll=true', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { 
        if (d.success) {
          setServices(d.data.services)
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(d.data.services.map((s: Service) => s.category))
          ).sort() as string[]
          setExistingCategories(uniqueCategories)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchServices() }, [])

  const openAddModal = () => {
    setEditingService(null)
    setShowCustomCategory(false)
    setCustomCategory('')
    setForm({ name: '', description: '', price: '', category: '', image: '', deliveryDays: '7', features: '' })
    setShowForm(true)
  }

  const openEditModal = (service: Service) => {
    setEditingService(service)
    const isCustomCategory = !existingCategories.includes(service.category)
    setShowCustomCategory(isCustomCategory)
    setCustomCategory(isCustomCategory ? service.category : '')
    setForm({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      category: isCustomCategory ? 'custom' : service.category,
      image: service.image || '',
      deliveryDays: service.deliveryDays.toString(),
      features: '',
    })
    setShowForm(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const reader = new FileReader()
      
      await new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = reader.result as string
            
            const cloudName = 'dp9xrfznz'
            const uploadData = new FormData()
            uploadData.append('file', base64)
            uploadData.append('upload_preset', 'techboom_unsigned')
            uploadData.append('folder', 'techboom/services')

            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              {
                method: 'POST',
                body: uploadData,
              }
            )

            const result = await response.json()
            
            if (response.ok && result.secure_url) {
              setForm((prev) => ({ ...prev, image: result.secure_url }))
              resolve(result)
            } else {
              console.error('Cloudinary error:', result)
              reject(new Error(result.error?.message || 'Upload failed'))
            }
          } catch (error) {
            reject(error)
          }
        }
        
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate custom category
    if (form.category === 'custom' && !customCategory.trim()) {
      alert('Please enter a custom category name')
      return
    }
    
    setSaving(true)
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      alert('Session expired. Please login again.')
      window.location.href = '/admin/login'
      return
    }
    
    const url = editingService ? `/api/services/${editingService.id}` : '/api/services'
    const method = editingService ? 'PUT' : 'POST'

    const finalCategory = form.category === 'custom' ? customCategory.trim() : form.category

    const payload: any = {
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: form.description,
      price: Number(form.price),
      deliveryDays: Number(form.deliveryDays),
      category: finalCategory,
    }

    if (form.image) {
      payload.image = form.image
    }

    if (form.features) {
      payload.features = form.features.split('\n').filter(Boolean)
    }

    try {
      console.log('[AdminServices] Submitting:', payload)
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      console.log('[AdminServices] Response:', data)
      
      if (res.status === 401) {
        alert('Session expired. Please login again.')
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.location.href = '/admin/login'
        return
      }
      
      if (!data.success) {
        alert(`Error: ${data.message || 'Failed to save service'}`)
        setSaving(false)
        return
      }
      
      alert(editingService ? 'Service updated successfully!' : 'Service created successfully!')
      setSaving(false)
      setShowForm(false)
      setShowCustomCategory(false)
      setCustomCategory('')
      setForm({ name: '', description: '', price: '', category: '', image: '', deliveryDays: '7', features: '' })
      fetchServices()
    } catch (error) {
      console.error('[AdminServices] Error:', error)
      alert('Failed to save service. Please try again.')
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    console.log('DELETE BUTTON CLICKED - Service ID:', id)
    if (!confirm('Are you sure you want to delete this service?')) return

    const token = localStorage.getItem('access_token')
    await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchServices()
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    console.log('TOGGLE ACTIVE BUTTON CLICKED - Service ID:', id, 'Current Status:', isActive)
    const token = localStorage.getItem('access_token')
    await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchServices()
  }

  return (
    <div className="space-y-6" data-version="2.0-fixed">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Services</h1>
          <p className="text-white/50 text-sm mt-1">Manage platform services</p>
        </div>
        <Button onClick={openAddModal} size="sm">
          + Add Service
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">{editingService ? 'Edit Service' : 'New Service'}</h3>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Service Image</label>
            {form.image && (
              <div className="mb-3 relative inline-block">
                <img src={form.image} alt="Service" className="w-32 h-32 object-cover rounded-lg border border-white/10" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: '' })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </div>
            )}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 cursor-pointer border-2 border-dashed border-purple-500/30">
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Upload Image from Device</span>
                  </>
                )}
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Price (₹)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => {
                  const value = e.target.value
                  setForm({ ...form, category: value })
                  setShowCustomCategory(value === 'custom')
                  if (value !== 'custom') setCustomCategory('')
                }}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 [&>option]:bg-gray-900 [&>option]:text-white"
              >
                <option value="">Select Category</option>
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">+ Create New Category</option>
              </select>
              {showCustomCategory && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category name"
                  required
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-white/40"
                />
              )}
            </div>
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
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>{editingService ? 'Update Service' : 'Create Service'}</Button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className={`bg-white/5 border rounded-2xl p-6 ${service.isActive ? 'border-white/10' : 'border-red-500/20 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {service.image ? (
                    <img src={service.image} alt={service.name} className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="text-3xl">{service.icon || '⚡'}</div>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${service.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{service.name}</h3>
              <p className="text-white/50 text-xs mb-3 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-yellow-400 font-bold">{formatCurrency(service.price)}</span>
                <span className="text-white/40 text-xs">{service.deliveryDays} days</span>
              </div>
              <div className="flex gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => openEditModal(service)}
                  className="flex-1 text-xs text-purple-400 hover:text-purple-300 transition-colors py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="flex-1 text-xs text-red-400 hover:text-red-300 transition-colors py-1"
                >
                  Delete
                </button>
                <button
                  onClick={() => toggleActive(service.id, service.isActive)}
                  className="flex-1 text-xs text-white/50 hover:text-white transition-colors py-1"
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
