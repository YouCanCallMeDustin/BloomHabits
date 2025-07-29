'use client'

import { useEffect, useState, useReducer, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/AuthProvider'
import { Loader2, Plus, LogOut, BarChart3, CheckCircle, Circle, Clock, Trash2, X, MoreVertical } from 'lucide-react'
import { HabitList } from '@/components/HabitList'
import { AddHabitModal } from '@/components/AddHabitModal'
import { HabitChart } from '@/components/HabitChart'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { useNotifications } from '@/hooks/useNotifications'
import { usePathname } from 'next/navigation'

type Habit = Database['public']['Tables']['habits']['Row']
type HabitLog = Database['public']['Tables']['habit_logs']['Row']

type State = {
  loading: boolean;
  dataLoaded: boolean;
  habits: Habit[];
  habitLogs: HabitLog[];
}

type Action =
  | { type: 'START_LOADING' }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'SET_HABIT_LOGS'; payload: HabitLog[] }
  | { type: 'FINISH_LOADING' }
  | { type: 'RESET' }

function reducer(state: State, action: Action): State {
  console.log('Reducer: Processing action', action.type, 'Current state:', state)
  
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, loading: true, dataLoaded: false }
    case 'SET_HABITS':
      return { ...state, habits: action.payload }
    case 'SET_HABIT_LOGS':
      return { ...state, habitLogs: action.payload }
    case 'FINISH_LOADING':
      const newState = { ...state, loading: false, dataLoaded: true }
      console.log('Reducer: Finishing loading, new state:', newState)
      return newState
    case 'RESET':
      console.log('Reducer: RESET action called!')
      return { loading: true, dataLoaded: false, habits: [], habitLogs: [] }
    default:
      return state
  }
}

export default function DashboardPage() {
  const { user, signOut } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()
  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    dataLoaded: false,
    habits: [],
    habitLogs: []
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const { permissionGranted, requestPermission, sendNotification } = useNotifications()
  const notificationCheckRef = useRef<NodeJS.Timeout>()
  const notifiedHabitsRef = useRef<Set<string>>(new Set())
  const notifiedOnTimeRef = useRef<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showSnoozeMenu, setShowSnoozeMenu] = useState<string | null>(null)
  const [showHabitMenu, setShowHabitMenu] = useState<string | null>(null)
  const [editHabit, setEditHabit] = useState<Habit | null>(null)

  const formatTimeString = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const getEmoji = (habitTitle: string) => {
    // Add relevant emojis based on habit title keywords
    const emojiMap: { [key: string]: string } = {
      water: '💧',
      drink: '🥤',
      exercise: '💪',
      workout: '🏋️',
      run: '🏃',
      walk: '🚶',
      meditate: '🧘',
      read: '📚',
      study: '📖',
      sleep: '😴',
      eat: '🍽️',
      poop: '💩',
      pee: '🚽',
      medicine: '💊',
      pill: '💊',
      default: '✨'
    }

    const lowercaseTitle = habitTitle.toLowerCase()
    const matchedEmoji = Object.entries(emojiMap)
      .find(([keyword]) => lowercaseTitle.includes(keyword))
    
    return matchedEmoji ? matchedEmoji[1] : emojiMap.default
  }

  useEffect(() => {
    console.log('Dashboard: State updated:', state)
  }, [state])

  useEffect(() => {
    if (user && !hasFetched) {
      dispatch({ type: 'RESET' })
      setHasFetched(true)
      fetchData()
    }
    // Reset fetch flag if user logs out
    if (!user && hasFetched) {
      setHasFetched(false)
    }
  }, [user, hasFetched])

  const fetchHabits = async (): Promise<Habit[]> => {
    if (!user) return []

    console.log('Fetching habits for user:', user.id)
    const { data, error } = await supabase
      .from('habits')
      .select('id, user_id, title, description, target_count, schedule, notification_enabled, reminder_minutes_before, is_active, interval_type, interval_value, interval_unit, weekly_days, monthly_day, custom_interval, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching habits:', error)
      return []
    } else {
      console.log('Habits fetched successfully:', data?.length || 0, 'habits')
      return data || []
    }
  }

  const fetchHabitLogs = async (): Promise<HabitLog[]> => {
    if (!user) return []

    console.log('Fetching habit logs for user:', user.id)
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching habit logs:', error)
      return []
    } else {
      console.log('Habit logs fetched successfully:', data?.length || 0, 'logs')
      return data || []
    }
  }

  const fetchData = async () => {
    if (!user) return

    console.log('Starting to fetch data...')
    dispatch({ type: 'START_LOADING' })
    
    try {
      const [habits, habitLogs] = await Promise.all([fetchHabits(), fetchHabitLogs()])
      console.log('Fetched habits:', habits)
      dispatch({ type: 'SET_HABITS', payload: habits })
      dispatch({ type: 'SET_HABIT_LOGS', payload: habitLogs })
      console.log('All data fetched, finishing loading')
      dispatch({ type: 'FINISH_LOADING' })
    } catch (error) {
      console.error('Error fetching data:', error)
      dispatch({ type: 'FINISH_LOADING' })
    }
  }

  // Debug state changes
  useEffect(() => {
    console.log('State changed:', {
      loading: state.loading,
      dataLoaded: state.dataLoaded,
      habitsCount: state.habits.length,
      habitLogsCount: state.habitLogs.length
    })
  }, [state])

  // Add this function to get progress message
  const getProgressMessage = (habit: Habit) => {
    const completedToday = getCompletionsToday(habit.id)
    const target = habit.target_count || 1
    return `Progress: ${completedToday}/${target} completed today`
  }

  // Add this function to get time context
  const getTimeContext = (scheduledTime: number) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const minutesUntil = scheduledTime - currentTime

    if (minutesUntil > 60) {
      const hours = Math.floor(minutesUntil / 60)
      const minutes = minutesUntil % 60
      return `in ${hours}h ${minutes}m`
    } else if (minutesUntil > 0) {
      return `in ${minutesUntil} minutes`
    } else if (minutesUntil > -5) {
      return 'now!'
    } else if (minutesUntil > -60) {
      return `${Math.abs(minutesUntil)} minutes ago`
    } else {
      const hours = Math.floor(Math.abs(minutesUntil) / 60)
      return `${hours}h ago`
    }
  }

  // Add function to toggle habit active status
  const toggleHabitActive = async (habitId: string, isActive: boolean) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: isActive })
        .eq('id', habitId)

      if (error) {
        console.error('Error updating habit:', error)
        return
      }

      // Update local state
      dispatch({
        type: 'SET_HABITS',
        payload: state.habits.map(h =>
          h.id === habitId ? { ...h, is_active: isActive } : h
        )
      })
    } catch (err) {
      console.error('Error updating habit:', err)
    }
  }

  // Add function to skip all habits for today
  const skipAllHabitsToday = async () => {
    if (!user) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    try {
      const { error } = await supabase
        .from('habit_skips')
        .insert(state.habits
          .filter(h => h.is_active)
          .map(habit => ({
            habit_id: habit.id,
            user_id: user.id,
            skip_date: today.toISOString().split('T')[0]
          }))
        )

      if (error) {
        console.error('Error skipping habits:', error)
        return
      }

      // Clear all notifications for today
      notifiedHabitsRef.current.clear()
      notifiedOnTimeRef.current.clear()
    } catch (err) {
      console.error('Error skipping habits:', err)
    }
  }

  // Update the notification handler to include expanded snooze options
  const handleHabitNotification = (habit: Habit, scheduledTime: number) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const notificationKey = `${habit.id}-${scheduledTime}`
    const onTimeKey = `ontime-${habit.id}-${scheduledTime}`
    
    const minutesUntil = scheduledTime - currentTime
    const timeStr = formatTimeString(scheduledTime)
    const emoji = getEmoji(habit.title)
    const progressMsg = getProgressMessage(habit)
    const timeContext = getTimeContext(scheduledTime)
    
    const sendHabitNotification = (isOnTime: boolean) => {
      // Create action buttons for the notification
      const actions = [
        {
          action: 'complete',
          title: '✅ Done',
        },
        {
          action: 'snooze',
          title: '⏰ Snooze',
        }
      ]

      const notificationOptions = {
        tag: isOnTime ? onTimeKey : notificationKey,
        actions: actions,
        data: { habitId: habit.id, scheduledTime },
        requireInteraction: true,
        badge: '/icon.png',
        icon: '/icon.png'
      }

      if (isOnTime) {
        sendNotification(
          `${emoji} Time for ${habit.title}!`,
          {
            ...notificationOptions,
            body: `Scheduled for ${timeStr} (${timeContext})\n${progressMsg}\n\nClick "Done" when completed!`,
          }
        )
        notifiedOnTimeRef.current.add(onTimeKey)
      } else {
        sendNotification(
          `${emoji} Upcoming: ${habit.title}`,
          {
            ...notificationOptions,
            body: `Scheduled for ${timeStr} (${timeContext})\n${progressMsg}\n\nGet ready!`,
          }
        )
        notifiedHabitsRef.current.add(notificationKey)
      }
    }

    // Handle "It's Time!" notification
    if (!notifiedOnTimeRef.current.has(onTimeKey) && 
        (minutesUntil === 0 || (minutesUntil < 0 && minutesUntil > -5))) { // Allow 5-minute grace period
      sendHabitNotification(true)
      
      // Reset notification flag at midnight
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const timeUntilMidnight = midnight.getTime() - now.getTime()
      
      setTimeout(() => {
        notifiedOnTimeRef.current.delete(onTimeKey)
      }, timeUntilMidnight)
    }
    
    // Handle reminder notifications with progressive reminders
    const reminderWindows = [
      habit.reminder_minutes_before,
      Math.floor(habit.reminder_minutes_before / 2),
      1
    ]

    if (!notifiedHabitsRef.current.has(notificationKey) && 
        reminderWindows.includes(minutesUntil)) {
      sendHabitNotification(false)
      
      // Reset notification flag at midnight
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const timeUntilMidnight = midnight.getTime() - now.getTime()
      
      setTimeout(() => {
        notifiedHabitsRef.current.delete(notificationKey)
      }, timeUntilMidnight)
    }
  }

  // Add service worker message handler
  useEffect(() => {
    const handleServiceWorkerMessage = async (event: MessageEvent) => {
      const { type, action, habitId, scheduledTime } = event.data

      if (type !== 'NOTIFICATION_ACTION' || !habitId) return

      if (action === 'complete') {
        await toggleHabitCompletion(habitId)
      } else if (action === 'snooze') {
        if (scheduledTime) {
          const key = `${habitId}-${scheduledTime}`
          notifiedHabitsRef.current.add(key)
          notifiedOnTimeRef.current.add(`ontime-${key}`)
        }
      }
    }

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage)
    
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage)
    }
  }, [])

  // Update notification click handler to handle snooze menu
  useEffect(() => {
    if (!('Notification' in window)) return

    const handleNotificationClick = async (event: any) => {
      const notification = event.notification
      const habitId = notification.data?.habitId
      const action = event.action

      if (!habitId) return

      if (action === 'complete') {
        await toggleHabitCompletion(habitId)
        notification.close()
      } else if (action === 'snooze') {
        if (notification.data?.scheduledTime) {
          const key = `${habitId}-${notification.data.scheduledTime}`
          notifiedHabitsRef.current.add(key)
          notifiedOnTimeRef.current.add(`ontime-${key}`)
        }
        notification.close()
      }
    }

    navigator.serviceWorker?.addEventListener('notificationclick', handleNotificationClick)
    
    return () => {
      navigator.serviceWorker?.removeEventListener('notificationclick', handleNotificationClick)
    }
  }, [])

  useEffect(() => {
    if (!permissionGranted) {
      requestPermission()
    }

    const checkScheduledHabits = () => {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()

      state.habits.forEach(habit => {
        if (!habit.notification_enabled) return

        const scheduledTimes = (habit.schedule || []).map(time => {
          const [hours, minutes] = time.split(':').map(Number)
          return hours * 60 + minutes
        })

        scheduledTimes.forEach(scheduledTime => {
          handleHabitNotification(habit, scheduledTime)
        })
      })
    }

    // Check every 30 seconds instead of every minute to catch edge cases
    notificationCheckRef.current = setInterval(checkScheduledHabits, 30000)

    // Run immediately on mount or when habits change
    checkScheduledHabits()

    return () => {
      if (notificationCheckRef.current) {
        clearInterval(notificationCheckRef.current)
      }
    }
  }, [state.habits, permissionGranted, sendNotification])

  useEffect(() => {
    if (!state.loading && state.dataLoaded && user && state.habits.length === 0 && pathname !== '/onboarding') {
      router.replace('/onboarding')
    }
  }, [state.loading, state.dataLoaded, user, state.habits.length, pathname, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const toggleHabitCompletion = async (habitId: string) => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const existingLog = state.habitLogs.find(
      log => log.habit_id === habitId && log.completed_at.startsWith(today)
    )

    if (existingLog) {
      // Remove completion
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('id', existingLog.id)

      if (!error) {
        dispatch({ type: 'SET_HABIT_LOGS', payload: state.habitLogs.filter(log => log.id !== existingLog.id) })
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
        dispatch({ type: 'SET_HABIT_LOGS', payload: [data, ...state.habitLogs] })
      }
    }
  }

  const isHabitCompletedToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0]
    return state.habitLogs.some(
      log => log.habit_id === habitId && log.completed_at.startsWith(today)
    )
  }

  function getCompletionsToday(habitId: string): number {
    const today = new Date().toISOString().split('T')[0]
    return state.habitLogs.filter(
      log => log.habit_id === habitId && log.completed_at.startsWith(today)
    ).length
  }

  function getNextScheduledTime(schedule: string[]): string {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    // Convert all times to minutes since midnight for comparison
    const scheduledTimes = schedule.map(time => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    })
    
    // Find the next time that hasn't passed today
    const nextTime = scheduledTimes.find(time => time > currentTime)
    
    if (nextTime !== undefined) {
      const hours = Math.floor(nextTime / 60)
      const minutes = nextTime % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
    
    // If all times have passed, return the first time for tomorrow
    const firstTime = scheduledTimes[0]
    const hours = Math.floor(firstTime / 60)
    const minutes = firstTime % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} (tomorrow)`
  }

  // Add delete habit function
  const deleteHabit = async (habitId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)

      if (error) {
        console.error('Error deleting habit:', error)
        return
      }

      // Update local state
      dispatch({ type: 'SET_HABITS', payload: state.habits.filter(h => h.id !== habitId) })
      dispatch({ type: 'SET_HABIT_LOGS', payload: state.habitLogs.filter(l => l.habit_id !== habitId) })
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Error deleting habit:', err)
    }
  }

  // Add snooze menu component
  const SnoozeMenu = ({ habitId, onClose }: { habitId: string, onClose: () => void }) => {
    const snoozeOptions = [
      { duration: 5, label: '5 minutes' },
      { duration: 15, label: '15 minutes' },
      { duration: 30, label: '30 minutes' },
      { duration: 60, label: '1 hour' }
    ]

    const handleSnooze = (minutes: number) => {
      const habit = state.habits.find(h => h.id === habitId)
      if (!habit) return

      setTimeout(() => {
        sendNotification(`${getEmoji(habit.title)} ${habit.title}`, {
          body: `Snoozed reminder for ${habit.title}`,
          tag: `snooze-${habit.id}-${Date.now()}`
        })
      }, minutes * 60 * 1000)

      onClose()
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Snooze for...</h3>
          <div className="space-y-2">
            {snoozeOptions.map(option => (
              <button
                key={option.duration}
                onClick={() => handleSnooze(option.duration)}
                className="w-full p-2 text-left hover:bg-gray-50 rounded-md"
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="mt-3 w-full p-2 text-gray-600 hover:bg-gray-50 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Add edit habit function
  const handleEditHabit = (habit: Habit) => {
    setEditHabit(habit)
    setShowHabitMenu(null)
  }

  // Add update habit function
  const handleUpdateHabit = async (updatedHabit: Habit) => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          title: updatedHabit.title,
          description: updatedHabit.description,
          target_count: updatedHabit.target_count,
          schedule: updatedHabit.schedule,
          notification_enabled: updatedHabit.notification_enabled,
          reminder_minutes_before: updatedHabit.reminder_minutes_before,
        })
        .eq('id', updatedHabit.id)
      if (error) {
        console.error('Error updating habit:', error)
        return
      }
      // Update local state
      dispatch({
        type: 'SET_HABITS',
        payload: state.habits.map(h => h.id === updatedHabit.id ? { ...h, ...updatedHabit } : h)
      })
      setEditHabit(null)
    } catch (err) {
      console.error('Error updating habit:', err)
    }
  }

  if (state.loading || !state.dataLoaded) {
    console.log('Dashboard: Still loading, showing loading screen. State:', {
      loading: state.loading,
      dataLoaded: state.dataLoaded,
      habitsCount: state.habits.length,
      habitLogsCount: state.habitLogs.length
    })
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your habits...</p>
        </div>
      </div>
    )
  }

  console.log('Dashboard: Loading complete, rendering dashboard. State:', {
    loading: state.loading,
    dataLoaded: state.dataLoaded,
    habitsCount: state.habits.length,
    habitLogsCount: state.habitLogs.length
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/sunflower.png" alt="Bloom Habits Logo" className="h-8 w-8 mr-3" />
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
                <div className="flex space-x-3">
                  <button
                    onClick={() => skipAllHabitsToday()}
                    className="btn-secondary flex items-center"
                  >
                    Skip All Today
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Habit
                  </button>
                </div>
              </div>

              {state.habits.length === 0 ? (
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
                  {state.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                        !habit.is_active ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center flex-1">
                        <button
                          onClick={() => toggleHabitCompletion(habit.id)}
                          className="mr-3 flex-shrink-0"
                        >
                          {isHabitCompletedToday(habit.id) ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-400 hover:text-primary-500" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 truncate">
                              {habit.title}
                            </h3>
                            {habit.target_count > 1 && (
                              <span className="ml-2 text-sm text-gray-500">
                                {getCompletionsToday(habit.id)}/{habit.target_count} today
                              </span>
                            )}
                          </div>
                          {habit.description && (
                            <p className="text-sm text-gray-500 truncate">
                              {habit.description}
                            </p>
                          )}
                          {habit.schedule && habit.schedule.length > 0 && (
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              Next: {getNextScheduledTime(habit.schedule)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowHabitMenu(habit.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(habit.id)}
                            className="ml-4 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Habit Menu */}
                        {showHabitMenu === habit.id && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Habit Options</h3>
                              <div className="space-y-2">
                                <button
                                  onClick={() => handleEditHabit(habit)}
                                  className="w-full p-2 text-left hover:bg-gray-50 rounded-md"
                                >
                                  Edit Habit
                                </button>
                                <button
                                  onClick={() => {
                                    toggleHabitActive(habit.id, !habit.is_active)
                                    setShowHabitMenu(null)
                                  }}
                                  className="w-full p-2 text-left hover:bg-gray-50 rounded-md"
                                >
                                  {habit.is_active ? 'Disable Habit' : 'Enable Habit'}
                                </button>
                              </div>
                              <button
                                onClick={() => setShowHabitMenu(null)}
                                className="mt-3 w-full p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delete Confirmation Modal */}
                      {showDeleteConfirm === habit.id && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Habit</h3>
                            <p className="text-gray-600 mb-4">
                              Are you sure you want to delete "{habit.title}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium rounded-md hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => deleteHabit(habit.id)}
                                className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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
              <HabitChart habits={state.habits} habitLogs={state.habitLogs} />
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
                  <span className="font-medium">{state.habits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Today</span>
                  <span className="font-medium">
                    {state.habits.filter(habit => isHabitCompletedToday(habit.id)).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">
                    {state.habits.length > 0
                      ? Math.round(
                          (state.habits.filter(habit => isHabitCompletedToday(habit.id)).length /
                            state.habits.length) *
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
                {state.habitLogs.slice(0, 5).map((log) => {
                  const habit = state.habits.find(h => h.id === log.habit_id)
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
                {state.habitLogs.length === 0 && (
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
        onHabitAdded={fetchData}
      />

      {/* Snooze Menu */}
      {showSnoozeMenu && (
        <SnoozeMenu
          habitId={showSnoozeMenu}
          onClose={() => setShowSnoozeMenu(null)}
        />
      )}

      {/* Edit Habit Modal */}
      {editHabit && (
        <AddHabitModal
          isOpen={!!editHabit}
          onClose={() => setEditHabit(null)}
          onHabitAdded={fetchData}
          initialHabit={editHabit}
          onSave={handleUpdateHabit}
          isEdit={true}
        />
      )}
    </div>
  )
} 