import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Inspection slots: Tue-Fri 5PM-7PM, Sat 11AM-7PM (1 hour slots)
function getAvailableSlots(date: string): string[] {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

  // Tuesday-Friday: 5PM-7PM
  if (day >= 2 && day <= 5) {
    return ['5:00 PM', '6:00 PM']
  }
  // Saturday: 11AM-7PM
  if (day === 6) {
    return ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM']
  }
  // Sunday/Monday closed
  return []
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    if (!date) return NextResponse.json({ slots: [] })

    const allSlots = getAvailableSlots(date)
    if (allSlots.length === 0) return NextResponse.json({ slots: [], closed: true })

    // Get booked slots for this date
    const { data: booked } = await supabaseAdmin
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', date)
      .eq('service_type', 'Inspection')
      .neq('status', 'cancelled')

    const bookedTimes = booked?.map(b => b.appointment_time) || []
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot))

    return NextResponse.json({ slots: availableSlots })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
