import React from 'react'
import { Plus } from 'lucide-react'

export default function FAB({ onClick }) {
  return (
    <button className="fab" onClick={onClick} aria-label="Upload Found Item">
      <Plus size={28} />
    </button>
  )
}
