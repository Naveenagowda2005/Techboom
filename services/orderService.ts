import { getAuthHeaders } from './authService'

export async function createOrder(serviceId: string, notes?: string, referralCode?: string) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ serviceId, notes, referralCode }),
  })
  return res.json()
}

export async function getOrders(page = 1, limit = 10) {
  const res = await fetch(`/api/orders?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  })
  return res.json()
}

export async function getOrder(id: string) {
  const res = await fetch(`/api/orders/${id}`, { headers: getAuthHeaders() })
  return res.json()
}

export async function initiatePayment(orderId: string) {
  const res = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ orderId }),
  })
  return res.json()
}

export async function verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
  const res = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
  })
  return res.json()
}
