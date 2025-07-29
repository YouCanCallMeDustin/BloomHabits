'use client'

import { useMemo, useState } from 'react'
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
import { format, startOfDay, addDays, addHours, addMinutes, addWeeks, addMonths, isSameDay, isSameHour, isSameMinute, isSameWeek, isSameMonth, startOfHour, startOfMinute, startOfWeek, startOfMonth } from 'date-fns';

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
  const [granularity, setGranularity] = useState<'minute' | 'hour' | 'day' | 'week' | 'month'>('day');

  // Helper to get date labels and group logs
  const getLabelsAndGroups = () => {
    const now = new Date();
    let labels: string[] = [];
    let groups: Date[] = [];
    if (granularity === 'minute') {
      // Last 60 minutes
      for (let i = 59; i >= 0; i--) {
        const d = addMinutes(startOfMinute(now), -i);
        labels.push(format(d, 'HH:mm'));
        groups.push(d);
      }
    } else if (granularity === 'hour') {
      // Last 24 hours
      for (let i = 23; i >= 0; i--) {
        const d = addHours(startOfHour(now), -i);
        labels.push(format(d, 'HH:00'));
        groups.push(d);
      }
    } else if (granularity === 'day') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = addDays(startOfDay(now), -i);
        labels.push(format(d, 'MMM dd'));
        groups.push(d);
      }
    } else if (granularity === 'week') {
      // Last 7 weeks
      for (let i = 6; i >= 0; i--) {
        const d = addWeeks(startOfWeek(now), -i);
        labels.push('Wk ' + format(d, 'w yyyy'));
        groups.push(d);
      }
    } else if (granularity === 'month') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = addMonths(startOfMonth(now), -i);
        labels.push(format(d, 'MMM yyyy'));
        groups.push(d);
      }
    }
    return { labels, groups };
  };

  const { labels, groups } = getLabelsAndGroups();

  // Group logs by selected granularity
  const habitData = habits.map(habit => {
    const data = groups.map((group, idx) => {
      if (granularity === 'minute') {
        return habitLogs.filter(
          log => log.habit_id === habit.id && isSameMinute(new Date(log.completed_at), group)
        ).length;
      } else if (granularity === 'hour') {
        return habitLogs.filter(
          log => log.habit_id === habit.id && isSameHour(new Date(log.completed_at), group)
        ).length;
      } else if (granularity === 'day') {
        return habitLogs.filter(
          log => log.habit_id === habit.id && isSameDay(new Date(log.completed_at), group)
        ).length;
      } else if (granularity === 'week') {
        return habitLogs.filter(
          log => log.habit_id === habit.id && isSameWeek(new Date(log.completed_at), group)
        ).length;
      } else if (granularity === 'month') {
        return habitLogs.filter(
          log => log.habit_id === habit.id && isSameMonth(new Date(log.completed_at), group)
        ).length;
      }
      return 0;
    });
    return {
      label: habit.title,
      data,
    };
  });

  const chartData = {
    labels,
    datasets: habitData,
  };

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
          callback: function(tickValue: string | number) {
            return tickValue === 1 ? 'Completed' : 'Not Done';
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
    <div>
      <div className="flex items-center mb-2">
        <label className="mr-2 font-medium">View by:</label>
        <select
          value={granularity}
          onChange={e => setGranularity(e.target.value as any)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="minute">Minute</option>
          <option value="hour">Hour</option>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>
      <Line data={chartData} options={options} />
    </div>
  )
} 