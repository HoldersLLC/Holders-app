import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, email, phone, service_type,
      appointment_date, appointment_time,
      firearm_info, repair_description, notes, user_id
    } = body

    // Save appointment
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        name, email, phone, service_type,
        appointment_date, appointment_time,
        firearm_info, repair_description, notes,
        user_id: user_id || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Send confirmation email to customer
    await resend.emails.send({
      from: `Holders LLC <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Appointment Request Received — Holders LLC`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #c85a22;">Appointment Request Received</h2>
          <p>Hi ${name},</p>
          <p>We've received your appointment request. Here are the details:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> ${service_type}</p>
            <p><strong>Date:</strong> ${new Date(appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            ${appointment_time ? `<p><strong>Time:</strong> ${appointment_time}</p>` : ''}
            ${firearm_info ? `<p><strong>Firearm:</strong> ${firearm_info}</p>` : ''}
            ${repair_description ? `<p><strong>Repair Description:</strong> ${repair_description}</p>` : ''}
          </div>
          <p>We'll confirm your appointment shortly. If you have questions, reply to this email or contact us at Sales@holders.llc</p>
          <p style="color: #666; font-size: 12px;">Holders LLC · portal.holders.llc</p>
        </div>
      `,
    })

    // Send notification to shop owner
    await resend.emails.send({
      from: `Holders LLC <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_FROM!,
      subject: `New ${service_type} Request — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #c85a22;">New Appointment Request</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
            <p><strong>Customer:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Service:</strong> ${service_type}</p>
            <p><strong>Date:</strong> ${appointment_date}</p>
            ${appointment_time ? `<p><strong>Time:</strong> ${appointment_time}</p>` : ''}
            ${firearm_info ? `<p><strong>Firearm:</strong> ${firearm_info}</p>` : ''}
            ${repair_description ? `<p><strong>Repair Description:</strong> ${repair_description}</p>` : ''}
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
          <p><a href="https://portal.holders.llc/admin/bookings">View in Admin Dashboard</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, appointment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { data: appointments } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })

    return NextResponse.json({ appointments })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
