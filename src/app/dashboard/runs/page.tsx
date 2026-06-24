'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  name: string;
  url: string;
  cron?: string;
  timezone: string;
  created_at: string;
}

interface ExecutionInstance {
  log_id: string;
  job_id: string;
  name: string;
  url: string;
  cron?: string;
  status_code: number;
  run_at: string;
}

export default function RunsDashboardPage() {
  const [executions, setExecutions] = useState<ExecutionInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchJobsWithTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch your user's scheduled jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*');

      if (jobsError) throw jobsError;

      // 2. Fetch log traces directly (ordered by most recent run first)
      const { data: logsData, error: logsError } = await supabase
        .from('job_logs')
        .select('id, job_id, status_code, created_at')
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      // Create a quick lookup map for jobs
      const jobsMap = new Map<string, Job>();
      (jobsData || []).forEach(job => jobsMap.set(job.id, job));

      // 3. Flatten logs into individual execution instances with job context
     // 3. Flatten logs into individual execution instances with job context
const mappedExecutions: ExecutionInstance[] = (logsData || [])
        .map((log): ExecutionInstance | null => {
          const associatedJob = jobsMap.get(log.job_id);
          if (!associatedJob) return null; // Filter out logs without an active job record

          return {
            log_id: log.id,
            job_id: log.job_id,
            name: associatedJob.name,
            url: associatedJob.url,
            cron: associatedJob.cron,
            status_code: log.status_code,
            run_at: log.created_at
          };
        })
        // Explicitly tell TypeScript that null values are filtered out:
        .filter((item): item is ExecutionInstance => item !== null);
      setExecutions(mappedExecutions);
    } catch (err) {
      console.error("Critical failure during client-side metrics calculation:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchJobsWithTelemetry();
  }, [fetchJobsWithTelemetry]);

  const aggregatedAnalytics = useMemo(() => {
    if (executions.length === 0) return { aggregateRuns: 0, averageSuccess: 100 };
    
    const successfulRuns = executions.filter(e => e.status_code >= 200 && e.status_code < 300).length;

    return {
      aggregateRuns: executions.length,
      averageSuccess: Math.round((successfulRuns / executions.length) * 100)
    };
  }, [executions]);

  if (loading) {
    return <div className="p-10 text-sm text-gray-500">Parsing upstream workspace runtime matrix...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4 sm:px-6 md:px-0 max-w-full overflow-x-hidden">
      {/* Return Navigation Anchor Link */}
      <Link href="/dashboard" className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-black">
        <ArrowLeft className="h-4 w-4" /> <span>Return to Workspace</span>
      </Link>

      {/* Responsive Workspace Telemetry Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <div className="border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Run Executions</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold text-black">{aggregatedAnalytics.aggregateRuns}</p>
        </div>
        <div className="border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Avg Success Signature</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold text-black">{aggregatedAnalytics.averageSuccess}%</p>
        </div>
      </div>

      {/* Context Component Header Row */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-bold">Chronological Runtime Stream</h3>
        <p className="text-xs text-gray-500 mt-1">Review isolated historical node actions sorted by execution time</p>
      </div>

      {/* Full-width Clickable Stack Container Layout */}
      {executions.length === 0 ? (
        <div className="border border-dashed border-gray-200 bg-white p-8 md:p-12 text-center">
          <p className="text-sm text-gray-500">No execution traces available for this operational account context.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {executions.map((execution) => {
            const isSuccess = execution.status_code >= 200 && execution.status_code < 300;
            return (
              <Link 
                key={execution.log_id} 
                href={`/dashboard/logs/${execution.job_id}`}
                className="block border border-gray-200 bg-white hover:border-slate-400 transition-all text-sm rounded-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                {/* Horizontal Flex Content Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 sm:gap-4">
                  
                  {/* Left Side: Status, Name, and Endpoint */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <div className="flex items-center gap-2 shrink-0">
                      {isSuccess ? (
                        <CheckCircle2 className="text-green-600 h-4 w-4 shrink-0" />
                      ) : (
                        <XCircle className="text-red-600 h-4 w-4 shrink-0" />
                      )}
                      
                      <span className={`font-mono text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${
                        isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        Status: {execution.status_code}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 block sm:inline mr-2">{execution.name}</span>
                      <span className="text-gray-400 text-[11px] sm:text-xs font-mono break-all block sm:inline">
                        {execution.url}
                      </span>
                    </div>
                  </div>

                  {/* Middle Context: Intervals */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end shrink-0 text-gray-500 text-[11px] sm:text-xs font-mono">
                    <span className="inline-block bg-gray-50 text-gray-700 rounded px-1.5 py-0.5 text-[11px]">
                      {execution.cron ? `cron(${execution.cron})` : 'once'}
                    </span>
                  </div>

                  {/* Right Side: Exact Execution Timestamp Anchor */}
                  <div className="sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 flex items-center justify-between sm:justify-end gap-3 text-[11px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {new Date(execution.run_at).toLocaleString()}
                    </span>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}