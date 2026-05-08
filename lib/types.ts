export type Role = 'coach' | 'athlete'

export type WorkoutType = 'Easy' | 'Tempo' | 'Intervals' | 'Long Run' | 'Recovery' | 'Strength' | 'Race' | 'Rest'

export type WorkoutStatus = 'planned' | 'in_progress' | 'completed' | 'missed'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: Role
  group_name: string | null
  joined_at: string | null
  notes: string | null
  created_at: string
}

export interface TrainingPlan {
  id: string
  athlete_id: string
  week_start: string
  title: string | null
  coach_notes: string | null
  created_at: string
}

export interface Workout {
  id: string
  plan_id: string
  athlete_id: string
  workout_date: string
  workout_type: WorkoutType
  planned_distance_km: number | null
  planned_pace: number | null
  planned_duration_min: number | null
  planned_intensity: number | null
  planned_notes: string | null
  actual_distance_km: number | null
  actual_pace: number | null
  actual_duration_min: number | null
  actual_avg_hr: number | null
  actual_rpe: number | null
  athlete_notes: string | null
  status: WorkoutStatus
  created_at: string
}

export interface IntervalSet {
  id: string
  workout_id: string
  set_number: number
  distance_m: number | null
  target_seconds: number | null
  actual_seconds: number | null
  hr: number | null
  rest_seconds: number | null
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Profile>
      }
      training_plans: {
        Row: TrainingPlan
        Insert: Omit<TrainingPlan, 'id' | 'created_at'> & { id?: string }
        Update: Partial<TrainingPlan>
      }
      workouts: {
        Row: Workout
        Insert: Omit<Workout, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Workout>
      }
      interval_sets: {
        Row: IntervalSet
        Insert: Omit<IntervalSet, 'id'> & { id?: string }
        Update: Partial<IntervalSet>
      }
    }
  }
}
