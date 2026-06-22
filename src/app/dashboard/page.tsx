'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Trash2, Terminal, Plus } from 'lucide-react';

interface Job {
  id: string;
  name: string;
  url: string;
  cron?: string;
  run_at?: string;
  timezone: string;
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchJobs = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/jobs?user_id=${user.id}`);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Error loading schedules", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const deleteJob = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!confirm('Are you sure you want to unschedule this worker?')) return;

    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/jobs/${id}?user_id=${user?.id}`, {
      method: 'DELETE',
    });
    fetchJobs();
  };

  return (
    <div className="space-y-6 md:space-y-8 px-1">
      {/* Top Bar: Adjusts layout dynamically from a vertical stack to a flat row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-black">Active Crons</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Monitor and update edge-triggered schedules</p>
        </div>
        <Link href="/dashboard/create" className="flex items-center justify-center space-x-2 bg-black px-4 py-3 sm:py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-all shadow-sm w-full sm:w-auto">
          <Plus className="h-4 w-4" /> <span>Create New Job</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading system nodes...</div>
      ) : jobs.length === 0 ? (
        <div className="border border-dashed border-gray-200 bg-white p-8 md:p-12 text-center">
          <p className="text-sm text-gray-500">No managed hooks mapped to this account environment</p>
        </div>
      ) : (
        <>
          {/* Mobile-Only Card Layout: Visible on screens below 768px */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {jobs.map((job) => (
              <div key={job.id} className="border border-gray-200 bg-white p-4 shadow-sm space-y-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-black text-base">{job.name}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5 break-all max-w-[240px] xs:max-w-[320px]">
                      {job.url}
                    </p>
                  </div>
                  <button 
                    onClick={() => deleteJob(job.id)} 
                    className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-all"
                    aria-label="Delete schedule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-xs text-slate-700">
                    <span className="font-medium text-gray-500 block mb-0.5">Interval Profile:</span>
                    <span className="inline-block bg-gray-100 rounded px-2 py-1 font-mono text-[11px] leading-tight">
                      {job.cron ? `cron(${job.cron})` : `run_at(${new Date(job.run_at!).toLocaleString()})`}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center space-x-1">
                    <span className="font-medium text-gray-500">Timezone:</span>
                    <span>{job.timezone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <Link href={`/dashboard/logs/${job.id}`} className="flex items-center justify-center space-x-2 border border-gray-200 w-full py-2.5 text-xs font-medium bg-white hover:bg-gray-50 active:bg-gray-100 transition-all">
                    <Terminal className="h-3.5 w-3.5" /> <span>View Execution Logs</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Viewport: Hidden below 768px (`md` checkpoint) */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="p-4">Job Name</th>
                  <th className="p-4">Destination Endpoint</th>
                  <th className="p-4">Interval Profile</th>
                  <th className="p-4">Zone context</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4 font-medium text-black">{job.name}</td>
                    <td className="p-4 text-gray-500 font-mono text-xs max-w-xs truncate" title={job.url}>
                      {job.url}
                    </td>
                    <td className="p-4 text-slate-700">
                      <span className="inline-block bg-gray-100 rounded px-2 py-0.5 font-mono text-xs">
                        {job.cron ? `cron(${job.cron})` : `run_at(${new Date(job.run_at!).toLocaleString()})`}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">{job.timezone}</td>
                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      <Link href={`/dashboard/logs/${job.id}`} className="inline-flex items-center space-x-1 border border-gray-200 px-2.5 py-1 text-xs font-medium hover:bg-gray-100 transition-all">
                        <Terminal className="h-3 w-3" /> <span>Logs</span>
                      </Link>
                      <button onClick={() => deleteJob(job.id)} className="text-gray-400 hover:text-red-600 transition-all">
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}