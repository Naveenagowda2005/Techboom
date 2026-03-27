const steps = [
  {
    step: '01',
    title: 'Choose a Service',
    description: 'Browse our wide range of digital services and pick what your business needs.',
    icon: '🔍',
  },
  {
    step: '02',
    title: 'Place Your Order',
    description: 'Fill in your requirements and make a secure payment via Razorpay.',
    icon: '📋',
  },
  {
    step: '03',
    title: 'We Get to Work',
    description: 'Our expert team starts working on your project immediately.',
    icon: '⚡',
  },
  {
    step: '04',
    title: 'Deliver & Grow',
    description: 'Receive your completed service and watch your business grow.',
    icon: '🚀',
  },
]

export default function HowItWorks() {
  return (
    <section className="section-padding bg-gradient-to-b from-transparent to-purple-950/20">
      <div className="container-max">
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Simple Process</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">How It Works</h2>
          <p className="text-white/50 max-w-xl mx-auto">Get started in minutes, not days.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
              )}

              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-600/30 to-purple-800/20 border border-purple-500/30 rounded-2xl flex items-center justify-center text-3xl">
                  {step.icon}
                </div>
                <div className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Step {step.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
