'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { Database } from '@/lib/supabase'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type Habit = Database['public']['Tables']['habits']['Row']
type HabitLog = Database['public']['Tables']['habit_logs']['Row']

interface HabitChartProps {
  habits: Habit[]
  habitLogs: HabitLog[]
}

export function HabitChart({ habits, habitLogs }: HabitChartProps) {
  const chartData = useMemo(() => {
    // Get last 7 days
    const dates = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }

    // Create datasets for each habit
    const datasets = habits.map((habit, index) => {
      const data = dates.map(date => {
        const completedOnDate = habitLogs.filter(
          log => log.habit_id === habit.id && log.completed_at.startsWith(date)
        ).length
        return completedOnDate > 0 ? 1 : 0
      })

      const colors = [
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#8B5CF6', // purple
        '#06B6D4', // cyan
        '#F97316', // orange
      ]

      return {
        label: habit.title,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length],
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    })

    return {
      labels: dates.map(date => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }),
      datasets,
    }
  }, [habits, habitLogs])

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: function(value: number) {
            return value === 1 ? 'Completed' : 'Not Done'
          }
        }
      },
    },
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No habits to display. Add some habits to see your progress!
      </div>
    )
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  )
} 