/**
 * Supabase Database Types
 *
 * This file will be auto-generated from your Supabase schema.
 * Run: pnpm run types:generate
 *
 * For now, this is a placeholder. Once you create your database schema (EP01),
 * you can generate types using the Supabase CLI.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Tables will be generated here after schema is created
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
