'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface PlannerChartProps {
  chartData: Array<{ name: string; Target: number; Average: number }>
}

export default function PlannerChart({ chartData }: PlannerChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
        <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[0, 1500]} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
          labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
        />
        <Bar dataKey="Target" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Average" fill="#27272a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
