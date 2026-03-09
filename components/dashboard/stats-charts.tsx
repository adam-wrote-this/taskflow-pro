'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '@/lib/types'
import type { TaskStatus, TaskPriority } from '@/lib/types'

interface TaskStatusChartProps {
  data: Record<TaskStatus, number>
}

export function TaskStatusChart({ data }: TaskStatusChartProps) {
  const chartData = Object.entries(TASK_STATUS_CONFIG).map(([status, config]) => ({
    name: config.label,
    value: data[status as TaskStatus] || 0,
    status,
  }))

  const colors = {
    backlog: 'hsl(var(--muted))',
    todo: 'hsl(var(--secondary))',
    in_progress: 'hsl(var(--primary))',
    review: 'hsl(var(--warning))',
    done: 'hsl(var(--success))',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>任务状态分布</CardTitle>
        <CardDescription>按状态分类的任务数量</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={70} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface TaskPriorityChartProps {
  data: Record<TaskPriority, number>
}

export function TaskPriorityChart({ data }: TaskPriorityChartProps) {
  const chartData = Object.entries(TASK_PRIORITY_CONFIG).map(([priority, config]) => ({
    name: config.label,
    value: data[priority as TaskPriority] || 0,
  }))

  const colors = [
    'hsl(var(--muted-foreground))',
    'hsl(var(--secondary-foreground))',
    'hsl(var(--warning))',
    'hsl(var(--destructive))',
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>任务优先级分布</CardTitle>
        <CardDescription>按优先级分类的任务比例</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface WeeklyActivityChartProps {
  data: { day: string; tasks: number }[]
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>本周任务活动</CardTitle>
        <CardDescription>过去 7 天完成的任务数量</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="tasks"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="完成任务"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
