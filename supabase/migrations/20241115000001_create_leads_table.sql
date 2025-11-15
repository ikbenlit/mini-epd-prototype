-- Create leads table for contact form submissions
-- Migration: 20241115000001_create_leads_table
-- Description: Stores lead information from contact form with project details

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Contact information
  name text not null,
  email text not null,
  company text,

  -- Project details
  project_type text not null,
  budget text,
  message text not null,

  -- Metadata
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'rejected')),
  notes text,
  source text default 'website',

  -- Tracking
  ip_address inet,
  user_agent text,
  referrer text
);

-- Add index for email lookups
create index if not exists leads_email_idx on public.leads (email);

-- Add index for status filtering
create index if not exists leads_status_idx on public.leads (status);

-- Add index for created_at sorting
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Enable Row Level Security
alter table public.leads enable row level security;

-- Policy: Anyone can insert (public form submission)
create policy "Anyone can submit leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

-- Policy: Only authenticated users can view leads (admin only)
create policy "Authenticated users can view leads"
  on public.leads
  for select
  to authenticated
  using (true);

-- Policy: Only authenticated users can update leads (admin only)
create policy "Authenticated users can update leads"
  on public.leads
  for update
  to authenticated
  using (true);

-- Add comment to table
comment on table public.leads is 'Contact form lead submissions with project details';

-- Add comments to important columns
comment on column public.leads.status is 'Lead status: new, contacted, qualified, converted, rejected';
comment on column public.leads.project_type is 'Type of project: Web app, Mobile app, etc.';
comment on column public.leads.message is 'Project description from contact form';
