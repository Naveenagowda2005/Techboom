import Link from 'next/link'

export default function ReferralSection() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="relative bg-gradient-to-br from-purple-900/40 to-yellow-900/10 border border-purple-500/30 rounded-3xl p-10 sm:p-16 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-yellow-400 text-sm font-semibold uppercase tracking-wider">Refer & Earn</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
                Earn 10% on Every Referral
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Share your unique referral link with friends and businesses. 
                Earn 10% commission on every order they place — automatically credited to your wallet.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { value: '10%', label: 'Commission Rate' },
                  { value: '₹0', label: 'Joining Fee' },
                  { value: '24h', label: 'Payout Time' },
                ].map((item) => (
                  <div key={item.label} className="text-center bg-white/5 rounded-xl p-4">
                    <div className="text-2xl font-black text-yellow-400">{item.value}</div>
                    <div className="text-xs text-white/50 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>

              <Link href="/signup" className="btn-accent inline-flex">
                Start Earning Now →
              </Link>
            </div>

            {/* Visual */}
            <div className="space-y-4">
              {[
                { name: 'Rahul referred Priya', amount: '+₹1,200', time: '2 hours ago' },
                { name: 'Amit referred TechCorp', amount: '+₹4,500', time: '5 hours ago' },
                { name: 'Sneha referred StartupX', amount: '+₹2,800', time: '1 day ago' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-sm">
                      {item.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-white/40">{item.time}</div>
                    </div>
                  </div>
                  <span className="text-green-400 font-bold text-sm">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
