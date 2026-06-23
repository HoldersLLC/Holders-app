export type Membership = 'free' | 'pro' | 'admin'
export type FirearmCategory = 'Handgun' | 'Rifle' | 'Shotgun' | 'NFA Item' | 'Other'
export type MaintenanceStatus = 'Good' | 'Due Soon' | 'Overdue'
export type ServiceType = 'Cleaning' | 'Lubrication' | 'Inspection' | 'Parts Replacement' | 'Optic Re-Zero' | 'Other'
export type DocType = 'Purchase Receipt' | 'Warranty' | 'Photo' | 'Insurance' | 'Manual' | 'Other'
export type ReminderType = 'Cleaning Due' | 'Inspection Due' | 'Optic Battery Due' | 'Carry Gun Inspection' | 'Parts Replacement'

export interface Profile {
  id: string
  name: string | null
  email: string | null
  membership: Membership
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface Firearm {
  id: string
  user_id: string
  manufacturer: string
  model: string
  caliber: string | null
  barrel_length: string | null
  serial_number: string | null
  purchase_date: string | null
  purchase_price: number | null
  current_value: number | null
  insurance_value: number | null
  notes: string | null
  photo_url: string | null
  category: FirearmCategory | null
  round_count: number
  last_cleaning_date: string | null
  last_inspection_date: string | null
  maintenance_status: MaintenanceStatus
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Maintenance {
  id: string
  firearm_id: string
  user_id: string
  date: string
  service_type: ServiceType
  notes: string | null
  photo_url: string | null
  round_count_at_service: number | null
  created_at: string
}

export interface RangeSession {
  id: string
  firearm_id: string
  user_id: string
  date: string
  range_name: string | null
  weather: string | null
  distance: string | null
  ammo_brand: string | null
  ammo_grain: string | null
  rounds_fired: number
  group_size: string | null
  notes: string | null
  created_at: string
}

export interface Part {
  id: string
  firearm_id: string
  user_id: string
  part_name: string
  replacement_interval: number | null
  current_rounds: number
  last_replaced_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  firearm_id: string | null
  user_id: string
  name: string
  doc_type: DocType | null
  file_url: string
  file_size: number | null
  created_at: string
}

export interface Reminder {
  id: string
  firearm_id: string
  user_id: string
  reminder_type: ReminderType
  due_date: string | null
  due_rounds: number | null
  is_active: boolean
  last_sent_at: string | null
  created_at: string
}
