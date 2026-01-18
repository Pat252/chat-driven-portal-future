'use client'

import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

export default function LandingPage() {
  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })

    if (error) {
      console.error('Error signing in:', error.message)
    }
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-hidden flex items-center justify-center">
      {/* Aurora Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-indigo-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-blue-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Frosted Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 backdrop-blur-xl bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-12 max-w-lg mx-auto shadow-2xl"
      >
        {/* Headline */}
        <h1 className="text-4xl font-light text-zinc-100 mb-6 text-center leading-tight">
          Time to use our own
          <br />
          ways of working.
        </h1>

        {/* Sub-text */}
        <p className="text-lg text-zinc-400 mb-8 text-center leading-relaxed">
          A private space to think, explore, and experiment
          <br />
          with local intelligence.
        </p>

        {/* Google Sign-in Button */}
        <div className="mb-6">
          <button
            onClick={handleSignIn}
            className="w-full px-6 py-3.5 bg-white hover:bg-zinc-100 text-zinc-900 font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            Continue with Google
          </button>
        </div>

        {/* Reassurance Text */}
        <p className="text-sm text-zinc-500 text-center mb-8">
          Used only for identity. No tracking. No training.
        </p>
      </motion.div>

      {/* Footer Text */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-xs text-zinc-600 font-mono">
          AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  )
}

