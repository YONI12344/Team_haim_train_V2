export type Role = 'coach' | 'athlete'

export type WorkoutType = 'Easy' | 'Tempo' | 'Intervals' | 'Long Run' | 'Recovery' | 'Strength' | 'Race' | 'Rest' | string

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
  workout_type: string
  planned_distance_km: number | null
  planned_pace: number | null
  planned_duration_min: number | null
  planned_intensity: number | null
  planned_notes: string | null
  actual_distance_km: number | null
  actual_pace: number | null
  actual_duration_min: number | null
  actual_reps: string | null
  actual_avg_hr: number | null
  actual_rpe: number | null
  athlete_notes: string | null
  status: WorkoutStatus
  created_at: string
}

export interface AthleteProfile {
  id: string
  athlete_id: string
  easy_pace: string | null
  tempo_pace: string | null
  interval_pace: string | null
  race_pace_1500: string | null
  race_pace_2000: string | null
  race_pace_3000: string | null
  race_pace_5000: string | null
  race_pace_10000: string | null
  race_pace_half_marathon: string | null
  race_pace_marathon: string | null
  pr_1500: string | null
  pr_2000: string | null
  pr_3000: string | null
  pr_5000: string | null
  pr_10000: string | null
  pr_half_marathon: string | null
  pr_marathon: string | null
  goal_1500: string | null
  goal_2000: string | null
  goal_3000: string | null
  goal_5000: string | null
  goal_10000: string | null
  goal_half_marathon: string | null
  goal_marathon: string | null
  main_goal: string | null
  coach_notes: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  athlete_id: string
  coach_id: string | null
  sender_id: string
  body: string
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
      athlete_profiles: {
        Row: AthleteProfile
        Insert: Partial<Omit<AthleteProfile, 'id' | 'created_at' | 'updated_at'>> & { athlete_id: string }
        Update: Partial<AthleteProfile>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Message>
      }
      interval_sets: {
        Row: IntervalSet
        Insert: Omit<IntervalSet, 'id'> & { id?: string }
        Update: Partial<IntervalSet>
      }
    }
  }
}
