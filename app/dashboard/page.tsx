'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/AuthProvider'
import { Loader2, Plus, LogOut, BarChart3, CheckCircle, Circle } from 'lucide-react'
import { HabitList } from '@/components/HabitList'
import { AddHabitModal } from '@/components/AddHabitModal'
import { HabitChart } from '@/components/HabitChart'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Habit = Database['public']['Tables']['habits']['Row']
type HabitLog = Database['public']['Tables']['habit_logs']['Row']

export default function DashboardPage() {
  const { user, signOut } = useAuthContext()
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchHabits()
    fetchHabitLogs()
  }, [user, router])

  const fetchHabits = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching habits:', error)
    } else {
      setHabits(data || [])
    }
  }

  const fetchHabitLogs = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching habit logs:', error)
    } else {
      setHabitLogs(data || [])
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const toggleHabitCompletion = async (habitId: string) => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const existingLog = habitLogs.find(
      log => log.habit_id === habitId && log.completed_at.startsWith(today)
    )

    if (existingLog) {
      // Remove completion
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('id', existingLog.id)

      if (!error) {
        setHabitLogs(prev => prev.filter(log => log.id !== existingLog.id))
      }
    } else {
      // Add completion
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (!error && data) {
        setHabitLogs(prev => [data, ...prev])
      }
    }
  }

  const isHabitCompletedToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0]
    return habitLogs.some(
      log => log.habit_id === habitId && log.completed_at.startsWith(today)
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Bloom Habits</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="btn-secondary flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Habits */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Today's Habits
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Habit
                </button>
              </div>

              {habits.length === 0 ? (
                <div className="text-center py-8">
                  <Circle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No habits yet</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                  >
                    Create your first habit
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleHabitCompletion(habit.id)}
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
              )}
            </div>

            {/* Habit Chart */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Habit Completion Trends
              </h2>
              <HabitChart habits={habits} habitLogs={habitLogs} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                This Week
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Habits</span>
                  <span className="font-medium">{habits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Today</span>
                  <span className="font-medium">
                    {habits.filter(habit => isHabitCompletedToday(habit.id)).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">
                    {habits.length > 0
                      ? Math.round(
                          (habits.filter(habit => isHabitCompletedToday(habit.id)).length /
                            habits.length) *
                            100
                        )
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {habitLogs.slice(0, 5).map((log) => {
                  const habit = habits.find(h => h.id === log.habit_id)
                  return (
                    <div key={log.id} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-600">
                        Completed {habit?.title} on{' '}
                        {new Date(log.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                  )
                })}
                {habitLogs.length === 0 && (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onHabitAdded={fetchHabits}
      />
    </div>
  )
} 