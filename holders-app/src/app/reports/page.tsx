import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { FileText, Download } from 'lucide-react'
import Link from 'next/link'

export default async function ReportsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const reports = [
    {
      title: 'Insurance Report',
      description: 'Full collection value, serial numbers, and photos for insurance purposes.',
      icon: '🛡️',
      comingSoon: false,
    },
    {
      title: 'Maintenance Report',
      description: 'Complete maintenance history for all firearms with service dates and notes.',
      icon: '🔧',
      comingSoon: false,
    },
    {
      title: 'Collection Summary',
      description: 'Overview of your full collection with specs, round counts, and values.',
      icon: '📋',
      comingSoon: false,
    },
    {
      title: 'Range Log Export',
      description: 'All range sessions with ammo data, group sizes, and conditions.',
      icon: '🎯',
      comingSoon: true,
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">Reports</h1>
        <p className="page-subheader">Generate PDF reports for insurance, maintenance, and collection records</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {reports.map(report => (
          <div key={report.title} className="card">
            <div className="flex items-start gap-4">
              <div className="text-2xl">{report.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{report.title}</h3>
                  {report.comingSoon && (
                    <span className="badge bg-surface-border text-slate-500 border border-surface-border">Coming soon</span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-4">{report.description}</p>
                <button
                  disabled={report.comingSoon}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    report.comingSoon
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-brand-400 hover:text-brand-300'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {report.comingSoon ? 'Not available yet' : 'Generate PDF'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6 border-brand-500/20 bg-brand-500/5">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white mb-1">PDF Generation</h3>
            <p className="text-slate-400 text-sm">
              Full PDF report generation is coming in Phase 3 of development. Reports will include all your firearms,
              maintenance records, valuations, and can be exported for insurance claims or storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
