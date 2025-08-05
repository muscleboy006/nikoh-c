import React, { useState } from 'react'

const Zaglushka = () => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('@hisobda_app')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Nusxalab bo‘lmadi:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
        Sayt yangilanmoqda
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8">
        1-2 kunda sayt ishga tushadi.
      </p>

      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-500 mb-10"></div>

      <div className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-full border border-gray-300">
        <span className="text-gray-800 font-medium">Admin: @hisobda_app</span>
        <button
          onClick={handleCopy}
          className="text-sm text-blue-600 hover:underline"
        >
          {copied ? 'Nusxa olindi!' : 'Nusxalash'}
        </button>
      </div>
    </div>
  )
}

export default Zaglushka