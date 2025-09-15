// supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Koneksi ke Supabase
const supabaseUrl = 'https://rvkmdvhhkutoozvdlzqp.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a21kdmhoa3V0b296dmRsenFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzODU3OTgsImV4cCI6MjA0Njk2MTc5OH0.9nGITfyx7I_Kw6V7R1QcYjKHQIuGnDa8Rp9oAE-vRp8';

export const supabase = createClient(supabaseUrl, supabaseKey);
