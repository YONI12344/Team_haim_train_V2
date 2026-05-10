'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Exercise {
  name: string
  detail: string
}

export default function NewWorkoutPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', detail: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addExercise() {
    setExercises([...exercises, { name: '', detail: '' }])
  }

  function updateExercise(index: number, field: keyof Exercise, value: string) {
    setExercises(exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)))
  }

  function removeExercise(index: number) {
    if (exercises.length === 1) return
    setExercises(exercises.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Please enter a workout title')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          notes: notes.trim() || null,
          exercises: exercises.filter((e) => e.name.trim()),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save workout')
      }
      router.push('/app')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="px-4 pt-14 pb-6">
      <div className="flex items-center justify-between mb-8">
        <Link href="/app" className="text-gray-400 text-sm font-medium active:text-gray-200">
          Cancel
        </Link>
        <h1 className="text-base font-bold text-white">Log Workout</h1>
        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          className="text-orange-400 text-sm font-semibold disabled:text-gray-600 transition-colors"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
            Workout Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning Run, Leg Day, WOD"
            className="w-full bg-gray-900 text-white placeholder-gray-600 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-800"
          />
        </div>

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Exercises
            </label>
            <button
              onClick={addExercise}
              className="text-orange-400 text-xs font-semibold active:text-orange-300"
            >
              Add Exercise
            </button>
          </div>
          <div className="space-y-2">
            {exercises.map((exercise, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(e) => updateExercise(index, 'name', e.target.value)}
                  placeholder="Exercise name"
                  className="flex-1 bg-gray-900 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-800 min-w-0"
                />
                <input
                  type="text"
                  value={exercise.detail}
                  onChange={(e) => updateExercise(index, 'detail', e.target.value)}
                  placeholder="3x10"
                  className="w-20 bg-gray-900 text-white placeholder-gray-600 rounded-xl px-3 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-800 shrink-0"
                />
                <button
                  onClick={() => removeExercise(index)}
                  disabled={exercises.length === 1}
                  className="text-gray-700 disabled:opacity-30 p-1 shrink-0 active:text-gray-400"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel? Any personal records?"
            rows={3}
            className="w-full bg-gray-900 text-white placeholder-gray-600 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-800 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          className="w-full bg-orange-500 text-white rounded-2xl py-4 font-semibold text-sm disabled:opacity-50 active:bg-orange-600 transition-colors"
        >
          {loading ? 'Saving Workout...' : 'Save Workout'}
        </button>
      </div>
    </div>
  )
}
