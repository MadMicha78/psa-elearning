import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vjyztwsqhnpwbwehzlob.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqeXp0d3NxaG5wd2J3ZWh6bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODg1MjEsImV4cCI6MjA5MjI2NDUyMX0.Ph4MAja7xxhOFCWWBZ4bC2cLAckSnBC6mf6VkacIEIg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
