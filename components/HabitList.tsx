'use client'

import { CheckCircle, Circle } from 'lucide-react'
import type { Database } from '@/lib/supabase'

type Habit = Database['public']['Tables']['habits']['Row']
type HabitLog = Database['public']['Tables']['habit_logs']['Row']

interface HabitListProps {
  habits: Habit[]
  habitLogs: HabitLog[]
  onToggleHabit: (habitId: string) => void
}

export function HabitList({ habits, habitLogs, onToggleHabit }: HabitListProps) {
  const isHabitCompletedToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0]
    return habitLogs.some(
      log => log.habit_id === habitId && log.completed_at.startsWith(today)
    )
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <div
          key={habit.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center">
            <button
              onClick={() => onToggleHabit(habit.id)}
              className="mr-3"
            >
              {isHabitCompletedToday(habit.id) ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-6 w-6 text-gray-400 hover:text-primary-500" />
              )}
            </button>
            <div>
              <h3 className="font-medium text-gray-900">
                {habit.title}
              </h3>
              {habit.description && (
                <p className="text-sm text-gray-500">
                  {habit.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 