-- Enable RLS (Row Level Security)
alter table auth.users enable row level security;

-- Create profiles table
create table public.patient_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  email text,
  gender text,
  date_of_birth date,
  blood_type text,
  height numeric,
  weight numeric,
  bmi numeric,
  notifications boolean default true,
  language text default 'English',
  constraint patient_profiles_id_key unique (id)
);

-- Create medical history table
create table public.medical_history (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patient_profiles(id) on delete cascade not null,
  condition text not null,
  timeframe text,
  status text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create allergies table
create table public.allergies (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patient_profiles(id) on delete cascade not null,
  allergen text not null,
  severity text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create medications table
create table public.medications (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patient_profiles(id) on delete cascade not null,
  name text not null,
  dosage text,
  frequency text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create emergency contacts table
create table public.emergency_contacts (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patient_profiles(id) on delete cascade not null,
  name text not null,
  relationship text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.patient_profiles enable row level security;
alter table public.medical_history enable row level security;
alter table public.allergies enable row level security;
alter table public.medications enable row level security;
alter table public.emergency_contacts enable row level security;

-- Create policies
create policy "Users can view own profile"
  on public.patient_profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.patient_profiles for update
  using ( auth.uid() = id );

-- Medical history policies
create policy "Users can view own medical history"
  on public.medical_history for select
  using ( auth.uid() = patient_id );

create policy "Users can insert own medical history"
  on public.medical_history for insert
  with check ( auth.uid() = patient_id );

create policy "Users can update own medical history"
  on public.medical_history for update
  using ( auth.uid() = patient_id );

create policy "Users can delete own medical history"
  on public.medical_history for delete
  using ( auth.uid() = patient_id );

-- Similar policies for allergies
create policy "Users can view own allergies"
  on public.allergies for select
  using ( auth.uid() = patient_id );

create policy "Users can insert own allergies"
  on public.allergies for insert
  with check ( auth.uid() = patient_id );

create policy "Users can update own allergies"
  on public.allergies for update
  using ( auth.uid() = patient_id );

create policy "Users can delete own allergies"
  on public.allergies for delete
  using ( auth.uid() = patient_id );

-- Similar policies for medications
create policy "Users can view own medications"
  on public.medications for select
  using ( auth.uid() = patient_id );

create policy "Users can insert own medications"
  on public.medications for insert
  with check ( auth.uid() = patient_id );

create policy "Users can update own medications"
  on public.medications for update
  using ( auth.uid() = patient_id );

create policy "Users can delete own medications"
  on public.medications for delete
  using ( auth.uid() = patient_id );

-- Similar policies for emergency contacts
create policy "Users can view own emergency contacts"
  on public.emergency_contacts for select
  using ( auth.uid() = patient_id );

create policy "Users can insert own emergency contacts"
  on public.emergency_contacts for insert
  with check ( auth.uid() = patient_id );

create policy "Users can update own emergency contacts"
  on public.emergency_contacts for update
  using ( auth.uid() = patient_id );

create policy "Users can delete own emergency contacts"
  on public.emergency_contacts for delete
  using ( auth.uid() = patient_id );

-- Create functions for automatic timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
  before update on public.patient_profiles
  for each row
  execute procedure public.handle_updated_at(); 