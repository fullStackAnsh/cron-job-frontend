'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, CheckCircle2, XCircle, Clock, BarChart3 } from 'lucide-react';
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

// Manual skeleton loading component
function LoadingState() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-1 pb-12 animate-pulse">
      <div className="h-8 w-48 bg-[#EFEFEC] rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="h-32 bg-[#EFEFEC] rounded-3xl" />
        <div className="h-32 bg-[#EFEFEC] rounded-3xl" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[#EFEFEC]/50 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function TelemetryViewContent({
  aggregatedAnalytics,
  executions
}: {
  aggregatedAnalytics: { aggregateRuns: number; averageSuccess: number };
  executions: ExecutionInstance[];
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-1 pb-12 overflow-x-hidden">
      <div className="space-y-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#BDBDBB] hover:text-[#283711] transition-colors uppercase tracking-widest group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Return to Workspace</span>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#283711]">Telemetry Overview</h2>
          <p className="text-sm font-medium text-[#BDBDBB] mt-1">Live metrics and historic trace sequences across active tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EFEFEC]/60 shadow-[0_20px_50px_rgba(40,55,17,0.02)] flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#283711]/50">Total Run Executions</p>
          <p className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-[#283711]">
            {aggregatedAnalytics.aggregateRuns}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EFEFEC]/60 shadow-[0_20px_50px_rgba(40,55,17,0.02)] flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#283711]/50">Avg Success Signature</p>
          <p className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-[#283711] flex items-baseline gap-1">
            {aggregatedAnalytics.averageSuccess}%
            <span className="text-xs font-bold text-[#9EE970] ml-1">● Stable</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 pb-2 border-b border-[#EFEFEC]/60">
        <BarChart3 className="h-4 w-4 text-[#283711]/60" />
        <h3 className="font-bold text-base text-[#283711]">Chronological Runtime Stream</h3>
      </div>

      {executions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#EFEFEC] p-8 md:p-12 text-center shadow-[0_20px_50px_rgba(40,55,17,0.01)]">
          <p className="text-sm font-medium text-[#BDBDBB]">No execution traces available for this operational account context.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {executions.map((execution) => {
            const isSuccess = execution.status_code >= 200 && execution.status_code < 300;
            return (
              <Link 
                key={execution.log_id} 
                href={`/dashboard/logs/${execution.job_id}`}
                className="block bg-white border border-[#EFEFEC]/70 rounded-2xl shadow-[0_10px_30px_rgba(40,55,17,0.01)] hover:border-[#9EE970] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#9EE970]/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 gap-3 sm:gap-4 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center gap-2 shrink-0">
                      {isSuccess ? (
                        <CheckCircle2 className="text-[#89d45c] h-4 w-4 shrink-0" />
                      ) : (
                        <XCircle className="text-red-500 h-4 w-4 shrink-0" />
                      )}
                      <span className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-wide shrink-0 ${
                        isSuccess ? 'bg-[#9EE970]/10 text-[#283711]' : 'bg-red-50 text-red-700'
                      }`}>
                        HTTP {execution.status_code}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[#283711] block sm:inline mr-2 tracking-tight">{execution.name}</span>
                      <span className="text-[#BDBDBB] text-xs font-mono break-all block sm:inline bg-[#EFEFEC]/30 px-1.5 py-0.5 rounded-md">{execution.url}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end shrink-0 font-mono">
                    <span className="inline-block bg-[#EFEFEC]/50 text-[#283711]/80 rounded-xl px-2.5 py-1 text-[11px] font-semibold border border-[#EFEFEC]">
                      {execution.cron ? `cron(${execution.cron})` : 'one-off'}
                    </span>
                  </div>
                  <div className="sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#EFEFEC]/40 flex items-center justify-between sm:justify-end gap-2 text-xs text-[#BDBDBB] font-mono">
                    <span className="flex items-center gap-1.5 bg-[#EFEFEC]/20 px-2.5 py-1 rounded-xl border border-[#EFEFEC]/40">
                      <Clock className="h-3.5 w-3.5 text-[#BDBDBB]" />
                      {new Date(execution.run_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
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

export default function RunsDashboardPage() {
  const [executions, setExecutions] = useState<ExecutionInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchJobsWithTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const { data: jobsData, error: jobsError } = await supabase.from('jobs').select('*');
      if (jobsError) throw jobsError;

      const { data: logsData, error: logsError } = await supabase
        .from('job_logs')
        .select('id, job_id, status_code, created_at')
        .order('created_at', { ascending: false });
      if (logsError) throw logsError;

      const jobsMap = new Map<string, Job>();
      (jobsData || []).forEach(job => jobsMap.set(job.id, job));

      const mappedExecutions = (logsData || [])
        .map((log): ExecutionInstance | null => {
          const associatedJob = jobsMap.get(log.job_id);
          if (!associatedJob) return null;
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

  if (loading) return <LoadingState />;

  return (
    <TelemetryViewContent 
      aggregatedAnalytics={aggregatedAnalytics}
      executions={executions}
    />
  );
}