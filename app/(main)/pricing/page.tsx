'use client'

import { BorderBeam } from '@/components/magicui/border-beam'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'

const pricingPlans = [
  {
    name: 'Free',
    description: 'Bring your own API key or self-hosted.',
    currency: '$',
    price: 0,
    link: '/app',
    recommended: false,
    features: [
      'All features included',
    ],
  },
]

export default function Pricing() {
  return <div className="container mx-auto py-8">
    <section className="relative w-full overflow-hidden md:mb-12">
      <div className="relative z-10 md:my-12 mb-6 flex flex-col items-center justify-center gap-4">
        <div className="flex w-full flex-col items-start justify-center space-y-4 md:items-center">
          <Badge variant="secondary">Pricing</Badge>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            LFG!
          </p>
          <p className="text-md max-w-xl md:text-center">
            In Alpha phase, we are offering a free tier for you to try our service.
          </p>
        </div>
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:gap-4">
        {pricingPlans.map((plan, index) => (
          <div
            key={index}
            className="w-full rounded-md border-[1px] p-6 text-left max-w-md mx-auto relative"
          >
            {plan.recommended ? <BorderBeam size={4000} duration={5} /> : <></>}
            <p className="mb-1 mt-0 text-sm font-medium uppercase text-pribg-primary">
              {plan.name}
            </p>
            <p className="my-0 text-sm">{plan.description}</p>
            <div className="my-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="space-y-1"
                >
                  <div>
                    <span className="text-3xl font-semibold">
                      {plan.currency}{plan.price.toLocaleString('en-US')}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
              <Button asChild className="mt-8 w-full">
                <a href={plan.link}>
                  Get Started
                </a>
              </Button>
            </div>
            {plan.features.map((feature, idx) => (
              <div key={idx} className="mb-3 flex items-center gap-2">
                <Check className="text-pribg-primary" size={18} />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  </div>
}
