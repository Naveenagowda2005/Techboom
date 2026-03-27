import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@techboom.in' },
    update: {},
    create: {
      name: 'Techboom Admin',
      email: 'admin@techboom.in',
      password: adminPassword,
      role: 'ADMIN',
      referralCode: 'ADMIN001',
      isVerified: true,
    },
  })
  console.log('✅ Admin created:', admin.email)

  // Create demo user
  const userPassword = await bcrypt.hash('User@123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@techboom.in' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@techboom.in',
      password: userPassword,
      role: 'USER',
      referralCode: 'DEMO001',
      isVerified: true,
    },
  })
  console.log('✅ Demo user created:', user.email)

  // Create services
  const services = [
    { name: 'App Development - Starter', slug: 'app-dev-starter', description: 'Single platform mobile app with up to 5 screens', price: 15000, category: 'App Development', icon: '📱', features: ['iOS or Android', 'Up to 5 screens', 'Basic UI', '1 month support'], deliveryDays: 30 },
    { name: 'App Development - Professional', slug: 'app-dev-pro', description: 'Cross-platform app with custom UI/UX and API integration', price: 35000, category: 'App Development', icon: '📱', features: ['iOS & Android', 'Up to 15 screens', 'Custom UI/UX', 'API integration', '3 months support'], deliveryDays: 45 },
    { name: 'Web Development - Landing Page', slug: 'web-landing', description: 'Professional landing page with SEO optimization', price: 8000, category: 'Web Development', icon: '🌐', features: ['1 page', 'Mobile responsive', 'SEO optimized', 'Contact form'], deliveryDays: 7 },
    { name: 'Web Development - Business Website', slug: 'web-business', description: 'Complete business website with CMS and blog', price: 20000, category: 'Web Development', icon: '🌐', features: ['Up to 10 pages', 'CMS integration', 'SEO + Analytics', 'Blog setup'], deliveryDays: 14 },
    { name: 'GST Registration', slug: 'gst-registration', description: 'Get your GSTIN in 3-5 working days', price: 999, category: 'GST Services', icon: '📊', features: ['GSTIN in 3-5 days', 'Document assistance', 'Expert support'], deliveryDays: 5 },
    { name: 'GST Return Filing', slug: 'gst-filing', description: 'Monthly GST return filing by certified experts', price: 499, category: 'GST Services', icon: '📊', features: ['GSTR-1 & GSTR-3B', 'Monthly filing', 'Compliance check'], deliveryDays: 3 },
    { name: 'Driving License - New', slug: 'dl-new', description: 'New driving license application with slot booking', price: 499, category: 'Driving License', icon: '🪪', features: ['Slot booking', 'Document prep', 'Status tracking'], deliveryDays: 15 },
    { name: 'E-Commerce Setup - Starter', slug: 'ecom-starter', description: 'Complete online store setup on Shopify or WooCommerce', price: 12000, category: 'E-Commerce', icon: '🛒', features: ['Shopify/WooCommerce', 'Up to 50 products', 'Payment gateway', 'Mobile responsive'], deliveryDays: 14 },
    { name: 'Influencer Campaign - Micro', slug: 'influencer-micro', description: 'Micro influencer campaign with 1-3 influencers', price: 5000, category: 'Influencer Marketing', icon: '🎯', features: ['1-3 influencers', 'Campaign brief', 'Performance report'], deliveryDays: 7 },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    })
  }
  console.log(`✅ ${services.length} services created`)

  // Create sample products
  const products = [
    { name: 'Business Card Design', slug: 'business-card-design', description: 'Professional business card design with 2 revisions', price: 299, category: 'Design', stock: 999, tags: ['design', 'branding'] },
    { name: 'Logo Design Package', slug: 'logo-design', description: 'Custom logo design with 3 concepts and unlimited revisions', price: 1999, salePrice: 1499, category: 'Design', stock: 999, tags: ['logo', 'branding'] },
    { name: 'Social Media Kit', slug: 'social-media-kit', description: '30 social media post templates for your brand', price: 999, category: 'Marketing', stock: 999, tags: ['social', 'templates'] },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: { ...product, images: [] },
    })
  }
  console.log(`✅ ${products.length} products created`)

  console.log('🎉 Seeding complete!')
  console.log('\n📋 Login credentials:')
  console.log('Admin: admin@techboom.in / Admin@123')
  console.log('User:  demo@techboom.in / User@123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
