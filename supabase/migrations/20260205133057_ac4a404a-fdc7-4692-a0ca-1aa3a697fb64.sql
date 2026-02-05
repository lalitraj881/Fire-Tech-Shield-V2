-- Create enum types
CREATE TYPE public.job_status AS ENUM ('not-started', 'in-progress', 'completed');
CREATE TYPE public.device_status AS ENUM ('pending', 'in-progress', 'completed', 'failed');
CREATE TYPE public.job_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.job_type AS ENUM ('maintenance', 'repair');
CREATE TYPE public.nc_status AS ENUM ('open', 'in-progress', 'closed');
CREATE TYPE public.nc_severity AS ENUM ('minor', 'critical');

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sites table
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Technicians/Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  assigned_customer_ids UUID[] DEFAULT '{}',
  assigned_site_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type public.job_type NOT NULL DEFAULT 'maintenance',
  status public.job_status NOT NULL DEFAULT 'not-started',
  priority public.job_priority NOT NULL DEFAULT 'medium',
  scheduled_date DATE,
  estimated_device_count INTEGER DEFAULT 0,
  nc_reference TEXT,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Devices table
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  system_type TEXT,
  serial_number TEXT,
  status public.device_status NOT NULL DEFAULT 'pending',
  image_url TEXT,
  location_description TEXT,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  qr_code TEXT,
  last_inspection_date DATE,
  next_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Non-Conformities table
CREATE TABLE public.ncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  site_id UUID REFERENCES public.sites(id) NOT NULL,
  status public.nc_status NOT NULL DEFAULT 'open',
  severity public.nc_severity NOT NULL DEFAULT 'minor',
  description TEXT,
  failed_checklist_items TEXT[] DEFAULT '{}',
  technician_remarks TEXT,
  photo_evidence TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for customers (viewable by assigned technicians)
CREATE POLICY "Technicians can view assigned customers" ON public.customers FOR SELECT
  USING (id IN (SELECT unnest(assigned_customer_ids) FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for sites (viewable by assigned technicians)
CREATE POLICY "Technicians can view assigned sites" ON public.sites FOR SELECT
  USING (id IN (SELECT unnest(assigned_site_ids) FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for jobs (viewable by technicians assigned to customer/site)
CREATE POLICY "Technicians can view jobs" ON public.jobs FOR SELECT
  USING (customer_id IN (SELECT unnest(assigned_customer_ids) FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Technicians can update jobs" ON public.jobs FOR UPDATE
  USING (customer_id IN (SELECT unnest(assigned_customer_ids) FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for devices
CREATE POLICY "Technicians can view devices" ON public.devices FOR SELECT
  USING (job_id IN (SELECT id FROM public.jobs WHERE customer_id IN (SELECT unnest(assigned_customer_ids) FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Technicians can update devices" ON public.devices FOR UPDATE
  USING (job_id IN (SELECT id FROM public.jobs WHERE customer_id IN (SELECT unnest(assigned_customer_ids) FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Technicians can insert devices" ON public.devices FOR INSERT
  WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE customer_id IN (SELECT unnest(assigned_customer_ids) FROM public.profiles WHERE id = auth.uid())));

-- RLS Policies for NCs
CREATE POLICY "Technicians can view ncs" ON public.ncs FOR SELECT
  USING (customer_id IN (SELECT unnest(assigned_customer_ids) FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Technicians can insert ncs" ON public.ncs FOR INSERT
  WITH CHECK (customer_id IN (SELECT unnest(assigned_customer_ids) FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Technicians can update ncs" ON public.ncs FOR UPDATE
  USING (customer_id IN (SELECT unnest(assigned_customer_ids) FROM public.profiles WHERE id = auth.uid()));

-- Create function for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'New User'), NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();