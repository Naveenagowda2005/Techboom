'use client'
import { useEffect, useState } from 'react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice: number | null
  category: string
  stock: number
  isActive: boolean
  images: string[]
  createdAt: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    salePrice: '',
    category: '',
    stock: '999',
    images: [] as string[],
  })
  const [newImageUrl, setNewImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [uploading, setUploading] = useState(false)

  const fetchProducts = () => {
    const token = localStorage.getItem('access_token')
    fetch('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.products) {
          setProducts(d.data.products)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      salePrice: '',
      category: '',
      stock: '999',
      images: [],
    })
    setNewImageUrl('')
    setCurrentImageIndex(0)
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || '',
      category: product.category,
      stock: product.stock.toString(),
      images: product.images || [],
    })
    setNewImageUrl('')
    setCurrentImageIndex(0)
    setShowModal(true)
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()],
      })
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
    // Adjust current index if needed
    if (currentImageIndex >= formData.images.length - 1) {
      setCurrentImageIndex(Math.max(0, formData.images.length - 2))
    }
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setFormData({ ...formData, images: newImages })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Convert to base64 and upload directly to Cloudinary from browser
        const reader = new FileReader()
        
        await new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64 = reader.result as string
              
              // Upload directly to Cloudinary
              const cloudName = 'dp9xrfznz'
              const uploadData = new FormData()
              uploadData.append('file', base64)
              uploadData.append('upload_preset', 'techboom_unsigned')
              uploadData.append('folder', 'techboom/products')

              const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                  method: 'POST',
                  body: uploadData,
                }
              )

              const result = await response.json()
              
              if (response.ok && result.secure_url) {
                uploadedUrls.push(result.secure_url)
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
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }))
        console.log('Successfully uploaded:', uploadedUrls)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload images. Please check console for details.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const token = localStorage.getItem('access_token')
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
    const method = editingProduct ? 'PUT' : 'POST'

    try {
      const payload: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        images: formData.images,
        tags: [],
        isActive: true,
      }

      // Only include salePrice if it has a value
      if (formData.salePrice && formData.salePrice.trim() !== '') {
        payload.salePrice = parseFloat(formData.salePrice)
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setShowModal(false)
        fetchProducts()
      } else {
        console.error('API Error:', JSON.stringify(data, null, 2))
        const errorMsg = data.message || data.error || 'Unknown error'
        const details = data.data ? JSON.stringify(data.data) : ''
        alert(`Failed to ${editingProduct ? 'update' : 'create'} product: ${errorMsg}\n${details}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const token = localStorage.getItem('access_token')
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) {
      fetchProducts()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Products</h1>
          <p className="text-white/50 text-sm mt-1">Manage your digital products</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">+ Add Product</button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} /></div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-white mb-2">No Products Yet</h3>
            <p className="text-white/50 mb-4">Start by adding your first product</p>
            <button onClick={openAddModal} className="btn-primary">+ Add Product</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/40">
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                  <tr key={product.id} className="text-sm hover:bg-white/3">
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        {/* Image Carousel */}
                        {product.images && product.images.length > 0 ? (
                          <div className="relative w-16 h-16 flex-shrink-0 group">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg border border-white/10"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/64?text=No+Image'
                              }}
                            />
                            {product.images.length > 1 && (
                              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                +{product.images.length - 1}
                              </div>
                            )}
                            {/* Hover to show all images */}
                            {product.images.length > 1 && (
                              <div className="absolute left-0 top-0 hidden group-hover:flex flex-col gap-1 bg-[#1a1333] border border-white/10 rounded-lg p-2 z-10 shadow-xl">
                                {product.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`${product.name} ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded border border-white/10"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://via.placeholder.com/80?text=Error'
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-16 h-16 flex-shrink-0 bg-white/5 rounded-lg flex items-center justify-center text-white/30 text-xs">
                            No Image
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{product.name}</div>
                          <div className="text-white/40 text-xs line-clamp-2">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60">{product.category}</td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">
                        {product.salePrice ? formatCurrency(product.salePrice) : formatCurrency(product.price)}
                      </div>
                      {product.salePrice && (
                        <div className="text-white/40 text-xs line-through">{formatCurrency(product.price)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white/60">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40">{formatDate(product.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(product)} className="text-purple-400 hover:text-purple-300 text-xs">Edit</button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1333] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <Input
                  label="Sale Price (optional)"
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
                <Input
                  label="Stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>

              {/* Image Management */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Product Images</label>
                <div className="space-y-3">
                  {/* Image Preview Carousel */}
                  {formData.images.length > 0 && (
                    <div className="relative bg-white/5 rounded-xl p-4 border border-white/10">
                      {/* Main Image Display */}
                      <div className="relative aspect-video bg-black/20 rounded-lg overflow-hidden mb-3">
                        <img
                          src={formData.images[currentImageIndex]}
                          alt={`Product ${currentImageIndex + 1}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL'
                          }}
                        />
                        {/* Navigation Arrows */}
                        {formData.images.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setCurrentImageIndex((currentImageIndex - 1 + formData.images.length) % formData.images.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrentImageIndex((currentImageIndex + 1) % formData.images.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center"
                            >
                              ›
                            </button>
                          </>
                        )}
                        {/* Image Counter */}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          {currentImageIndex + 1} / {formData.images.length}
                        </div>
                      </div>
                      
                      {/* Thumbnail Strip */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative flex-shrink-0 group">
                            <button
                              type="button"
                              onClick={() => setCurrentImageIndex(index)}
                              className={`relative w-16 h-16 rounded border-2 overflow-hidden ${
                                currentImageIndex === index ? 'border-purple-500' : 'border-white/10'
                              }`}
                            >
                              <img
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/64?text=Error'
                                }}
                              />
                              {index === 0 && (
                                <div className="absolute top-0 left-0 bg-purple-500 text-white text-xs px-1">
                                  Main
                                </div>
                              )}
                            </button>
                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                              ×
                            </button>
                            {/* Reorder Buttons */}
                            <div className="absolute bottom-0 left-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, index - 1)}
                                  className="flex-1 bg-blue-500/80 text-white text-xs py-0.5"
                                >
                                  ‹
                                </button>
                              )}
                              {index < formData.images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, index + 1)}
                                  className="flex-1 bg-blue-500/80 text-white text-xs py-0.5"
                                >
                                  ›
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Add Image - File Upload */}
                  <div className="space-y-2">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="image-upload"
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
                            <span>Upload Images from Device</span>
                          </>
                        )}
                      </div>
                    </label>
                    <p className="text-xs text-white/40 text-center">
                      Click to select images from your device. You can select multiple images at once.
                    </p>
                  </div>
                  
                  {/* Or add via URL */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-[#1a1333] text-white/40">OR</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 text-sm"
                    >
                      + Add URL
                    </button>
                  </div>
                  <p className="text-xs text-white/40">
                    First image will be the main product image. Hover over thumbnails to reorder or remove.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" loading={saving} className="flex-1">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-outline"
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
