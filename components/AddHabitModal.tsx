'use client'

import { useState, useEffect } from 'react'
import { Loader2, Bell, BellOff, X, Plus, Minus, Clock, ChevronDown, Sun, Moon, Coffee, Briefcase, Book, Dumbbell, Heart, Save, User, Smile } from 'lucide-react';
import { useAuthContext } from './AuthProvider'
import { supabase } from '@/lib/supabase'
import { useNotifications } from '@/hooks/useNotifications'

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitAdded: () => void;
  initialHabit?: any;
  onSave?: (habit: any) => void;
  isEdit?: boolean;
}

interface PresetCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface SchedulePreset {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_times: { start: string; end: string }[];
  is_default: boolean;
  created_at: string;
}

export function AddHabitModal({ isOpen, onClose, onHabitAdded, initialHabit, onSave, isEdit }: AddHabitModalProps) {
  const { user } = useAuthContext()
  const [title, setTitle] = useState(initialHabit?.title || '')
  const [description, setDescription] = useState(initialHabit?.description || '')
  const [targetCount, setTargetCount] = useState(initialHabit?.target_count || 1)
  const [notificationEnabled, setNotificationEnabled] = useState(initialHabit?.notification_enabled ?? true)
  const [reminderMinutes, setReminderMinutes] = useState(initialHabit?.reminder_minutes_before || 15)
  const [schedule, setSchedule] = useState<string[]>(initialHabit?.schedule || ['09:00'])
  const [loading, setLoading] = useState(false)
  const { requestPermission, permissionState } = useNotifications()
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
  const [showScheduleGenerator, setShowScheduleGenerator] = useState(false)
  const [scheduleStart, setScheduleStart] = useState('09:00')
  const [scheduleEnd, setScheduleEnd] = useState('21:00')
  const [scheduleInterval, setScheduleInterval] = useState('60')
  const [schedulePreset, setSchedulePreset] = useState('custom')
  const [breakTimes, setBreakTimes] = useState<{ start: string; end: string }[]>([])
  const [customPresets, setCustomPresets] = useState<any[]>([])
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [categories, setCategories] = useState<PresetCategory[]>([])
  const [presets, setPresets] = useState<SchedulePreset[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [newPresetCategory, setNewPresetCategory] = useState('')

  // Icon mapping for categories
  const categoryIcons: { [key: string]: any } = {
    briefcase: Briefcase,
    heart: Heart,
    book: Book,
    dumbbell: Dumbbell,
    user: User,
    moon: Moon,
    coffee: Coffee,
    smile: Smile,
    default: Clock
  }

  // Load categories and presets
  useEffect(() => {
    if (user) {
      loadCategories()
      loadPresets()
    }
  }, [user])

  // If initialHabit changes (editing a different habit), update state
  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title || '');
      setDescription(initialHabit.description || '');
      setTargetCount(initialHabit.target_count || 1);
      setNotificationEnabled(initialHabit.notification_enabled ?? true);
      setReminderMinutes(initialHabit.reminder_minutes_before || 15);
      setSchedule(initialHabit.schedule || ['09:00']);
    }
  }, [initialHabit]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('preset_categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error loading categories:', error)
        return
      }

      setCategories(data || [])
      if (data?.length > 0) {
        setNewPresetCategory(data[0].id)
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadPresets = async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_presets')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading presets:', error)
        return
      }

      setPresets(data || [])
    } catch (err) {
      console.error('Error loading presets:', err)
    }
  }

  const saveCustomPreset = async () => {
    if (!user || !newPresetName.trim() || !newPresetCategory) return

    try {
      const { error } = await supabase
        .from('schedule_presets')
        .insert({
          user_id: user.id,
          category_id: newPresetCategory,
          name: newPresetName.trim(),
          start_time: scheduleStart,
          end_time: scheduleEnd,
          break_times: breakTimes,
          is_default: false
        })

      if (error) {
        console.error('Error saving preset:', error)
        return
      }

      loadPresets()
      setShowSavePreset(false)
      setNewPresetName('')
    } catch (err) {
      console.error('Error saving preset:', err)
    }
  }

  const deleteCustomPreset = async (presetId: string) => {
    try {
      const { error } = await supabase
        .from('schedule_presets')
        .delete()
        .eq('id', presetId)

      if (error) {
        console.error('Error deleting preset:', error)
        return
      }

      loadPresets()
    } catch (err) {
      console.error('Error deleting preset:', err)
    }
  }

  const applyCustomPreset = (preset: any) => {
    setScheduleStart(preset.start_time)
    setScheduleEnd(preset.end_time)
    setBreakTimes(preset.break_times || [])
    setSchedulePreset('custom')
  }

  const handlePresetChange = (preset: string) => {
    setSchedulePreset(preset)
    if (preset !== 'custom') {
      const { start, end } = builtInPresets[preset]
      setScheduleStart(start)
      setScheduleEnd(end)
    }
  }

  const addBreakTime = () => {
    setBreakTimes([...breakTimes, { start: '12:00', end: '13:00' }])
  }

  const removeBreakTime = (index: number) => {
    setBreakTimes(breakTimes.filter((_, i) => i !== index))
  }

  const updateBreakTime = (index: number, field: 'start' | 'end', value: string) => {
    const newBreakTimes = [...breakTimes]
    newBreakTimes[index][field] = value
    setBreakTimes(newBreakTimes)
  }

  const addTimeSlot = () => {
    setSchedule([...schedule, '09:00'])
  }

  const removeTimeSlot = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index))
  }

  const updateTimeSlot = (index: number, time: string) => {
    const newSchedule = [...schedule]
    newSchedule[index] = time
    setSchedule(newSchedule)
  }

  const generateSchedule = () => {
    const [startHour, startMinute] = scheduleStart.split(':').map(Number)
    const [endHour, endMinute] = scheduleEnd.split(':').map(Number)
    const interval = parseInt(scheduleInterval)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    const times: string[] = []

    // Convert break times to minute ranges
    const breakRanges = breakTimes.map(({ start, end }) => {
      const [startH, startM] = start.split(':').map(Number)
      const [endH, endM] = end.split(':').map(Number)
      return {
        start: startH * 60 + startM,
        end: endH * 60 + endM
      }
    })

    for (let minutes = startMinutes; minutes <= endMinutes; minutes += interval) {
      // Check if current time falls within any break period
      const isBreakTime = breakRanges.some(
        range => minutes >= range.start && minutes <= range.end
      )

      if (!isBreakTime) {
        const hour = Math.floor(minutes / 60)
        const minute = minutes % 60
        times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
      }
    }

    setSchedule(times)
    setShowScheduleGenerator(false)
  }

  const applyPreset = (preset: SchedulePreset) => {
    setScheduleStart(preset.start_time)
    setScheduleEnd(preset.end_time)
    setBreakTimes(preset.break_times || [])
    setSchedulePreset('custom')
  }

  const deletePreset = async (presetId: string) => {
    try {
      const { error } = await supabase
        .from('schedule_presets')
        .delete()
        .eq('id', presetId)

      if (error) {
        console.error('Error deleting preset:', error)
        return
      }

      loadPresets()
    } catch (err) {
      console.error('Error deleting preset:', err)
    }
  }

  // Update the ScheduleGenerator component
  const ScheduleGenerator = () => (
    <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-[70vh] overflow-y-auto">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Generate Schedule</h4>
      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Presets Grid */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Schedule Presets</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets
              .filter(preset => selectedCategory === 'all' || preset.category_id === selectedCategory)
              .map((preset) => {
                const category = categories.find(c => c.id === preset.category_id)
                const IconComponent = categoryIcons[category?.icon || 'default']
                
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`flex items-center p-3 rounded-md border ${
                      preset.is_default ? 'border-primary-200 bg-primary-50' : 'border-gray-300'
                    } hover:bg-gray-50 text-left group`}
                  >
                    <IconComponent className="h-5 w-5 mr-3 text-gray-400 group-hover:text-primary-500" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {preset.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {preset.start_time} - {preset.end_time}
                        {preset.break_times?.length > 0 && ` (${preset.break_times.length} breaks)`}
                      </div>
                    </div>
                    {!preset.is_default && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePreset(preset.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </button>
                )
              })}
          </div>
        </div>

        {/* Time Range and Break Times */}
        <div className="space-y-4 border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={scheduleStart}
                onChange={(e) => setScheduleStart(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={scheduleEnd}
                onChange={(e) => setScheduleEnd(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Interval Selection */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Repeat Every</label>
            <select
              value={scheduleInterval}
              onChange={(e) => setScheduleInterval(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="240">4 hours</option>
            </select>
          </div>

          {/* Break Times */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm text-gray-600">Break Times</label>
              <button
                type="button"
                onClick={addBreakTime}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Break
              </button>
            </div>
            <div className="space-y-2">
              {breakTimes.map((breakTime, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={breakTime.start}
                    onChange={(e) => updateBreakTime(index, 'start', e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={breakTime.end}
                    onChange={(e) => updateBreakTime(index, 'end', e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeBreakTime(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between space-x-2 mt-4">
          <button
            type="button"
            onClick={() => setShowSavePreset(true)}
            className="px-3 py-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <Save className="h-4 w-4 mr-1" />
            Save as Preset
          </button>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowScheduleGenerator(false)}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={generateSchedule}
              className="px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Save Preset Modal */}
      {showSavePreset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Custom Preset</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Preset Name</label>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g., My Work Schedule"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Category</label>
                <select
                  value={newPresetCategory}
                  onChange={(e) => setNewPresetCategory(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-500">
                This will save your current time range and break times as a preset.
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSavePreset(false)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveCustomPreset}
                  disabled={!newPresetName.trim() || !newPresetCategory}
                  className="px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  Save Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      if (permissionState === 'denied') {
        setShowPermissionPrompt(true)
        setNotificationEnabled(false)
        return
      }
      const granted = await requestPermission()
      setNotificationEnabled(granted)
      if (!granted) {
        setShowPermissionPrompt(true)
      }
    } else {
      setNotificationEnabled(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim()) return

    setLoading(true)
    try {
      if (isEdit && onSave && initialHabit) {
        // Update existing habit
        await onSave({
          ...initialHabit,
          title: title.trim(),
          description: description.trim() || null,
          target_count: targetCount,
          schedule,
          notification_enabled: notificationEnabled,
          reminder_minutes_before: reminderMinutes,
        });
        setLoading(false);
        return;
      }
      // Create new habit
      const { error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          target_count: targetCount,
          schedule,
          notification_enabled: notificationEnabled,
          reminder_minutes_before: reminderMinutes,
        })

      if (error) {
        console.error('Error creating habit:', error)
      } else {
        setTitle('')
        setDescription('')
        setTargetCount(1)
        setSchedule(['09:00'])
        setNotificationEnabled(true)
        setReminderMinutes(15)
        onHabitAdded()
        onClose()
      }
    } catch (err) {
      console.error('Error creating habit:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderNotificationToggle = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {notificationEnabled ? (
            <Bell className="h-5 w-5 text-primary-600" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          <label htmlFor="notifications" className="text-sm text-gray-700">
            Enable notifications
          </label>
        </div>
        <button
          type="button"
          onClick={() => handleNotificationToggle(!notificationEnabled)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            notificationEnabled ? 'bg-primary-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              notificationEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      {showPermissionPrompt && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
          {permissionState === 'denied' ? (
            <p>
              Notifications are blocked. Please enable them in your browser settings to receive reminders.
              <br />
              <span className="text-xs">
                Usually found by clicking the lock/info icon in your browser's address bar.
              </span>
            </p>
          ) : (
            <p>
              Please allow notifications when prompted to receive reminders for your habits.
            </p>
          )}
        </div>
      )}
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Habit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Habit Name
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter habit name"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Add a description"
              rows={2}
            />
          </div>

          <div>
            <label htmlFor="targetCount" className="block text-sm font-medium text-gray-700">
              Daily Target
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
                className="rounded-md bg-gray-100 p-2 hover:bg-gray-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center">{targetCount}</span>
              <button
                type="button"
                onClick={() => setTargetCount(targetCount + 1)}
                className="rounded-md bg-gray-100 p-2 hover:bg-gray-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Schedule
              </label>
              <button
                type="button"
                onClick={() => setShowScheduleGenerator(!showScheduleGenerator)}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
              >
                <Clock className="h-4 w-4 mr-1" />
                Quick Schedule
              </button>
            </div>

            {showScheduleGenerator && <ScheduleGenerator />}

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 border rounded-md bg-white">
              {schedule.map((time, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTimeSlot(index, e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {schedule.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTimeSlot}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add time slot
              </button>
            </div>
          </div>

          {renderNotificationToggle()}

          {notificationEnabled && (
            <div>
              <label htmlFor="reminderMinutes" className="block text-sm font-medium text-gray-700">
                Remind me before
              </label>
              <select
                id="reminderMinutes"
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>
          )}

          <div className="pt-4 border-t flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEdit ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Save Changes' : 'Create Habit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 