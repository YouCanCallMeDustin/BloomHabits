'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useAuthContext } from './AuthProvider'
import { supabase } from '@/lib/supabase'

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onHabitAdded: () => void
}

export function AddHabitModal({ isOpen, onClose, onHabitAdded }: AddHabitModalProps) {
  const { user } = useAuthContext()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
        })

      if (error) {
        console.error('Error creating habit:', error)
      } else {
        setTitle('')
        setDescription('')
        onHabitAdded()
        onClose()
      }
    } catch (err) {
      console.error('Error creating habit:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Habit</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Habit Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="e.g., Exercise for 30 minutes"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Add a description for your habit..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 