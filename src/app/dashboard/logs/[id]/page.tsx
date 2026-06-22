'use client';
import { useEffect, useState, use, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Log {
  id: string;
  created_at: string;
  status_code: number;
  response: string;
  execution_time_ms: number;
}

export default function JobLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Success' | 'Failed'>('All');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    if (!jobId) {
      console.log("Waiting for a valid jobId...");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('job_logs')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
       
    if (error) {
      console.error("Supabase Error:", error.message);
      console.error("Error Hint:", error.hint);
    } else if (data) {
      console.log("Successfully fetched logs:", data);
      setLogs(data);
    }
    
    setLoading(false);
  }, [supabase, jobId]);
     
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const analytics = useMemo(() => {
    if (logs.length === 0) return { total: 0, rate: 0, last: 'N/A' };
    const successCount = logs.filter(l => l.status_code >= 200 && l.status_code < 300).length;
    return {
      total: logs.length,
      rate: Math.round((successCount / logs.length) * 100),
      last: new Date(logs[0].created_at).toLocaleString(),
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (statusFilter === 'Success') return log.status_code >= 200 && log.status_code < 300;
      if (statusFilter === 'Failed') return log.status_code >= 400 || log.status_code < 200;
      return true;
    });
  }, [logs, statusFilter]);

  if (loading) return <div className="p-10 text-sm text-gray-500">Parsing upstream operational metrics trace...</div>;

  return (
    <div className="space-y-6 md:space-y-8 px-4 sm:px-6 md:px-0 max-w-full overflow-x-hidden">
      <Link href="/dashboard" className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-black">
        <ArrowLeft className="h-4 w-4" /> <span>Return to Workspace</span>
      </Link>

      {/* Responsive Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Run Cycles</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold text-black">{analytics.total}</p>
        </div>
        <div className="border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Execution Success Rate</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold text-black">{analytics.rate}%</p>
        </div>
        <div className="border border-gray-200 bg-white p-4 md:p-6 shadow-sm col-span-1 sm:col-span-2 md:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Last Telemetry Active</p>
          <p className="mt-2 text-xs md:text-sm font-semibold text-gray-700 break-words">{analytics.last}</p>
        </div>
      </div>

      {/* Responsive Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
        <h3 className="text-lg font-bold">Execution Logs Traces</h3>
        <select 
          className="w-full sm:w-auto border border-gray-200 p-2 bg-white text-xs font-medium focus:outline-none" 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value as any)}
        >
          <option value="All">All Status Codes</option>
          <option value="Success">Success (2xx)</option>
          <option value="Failed">Failed (4xx/5xx)</option>
        </select>
      </div>

      {/* Logs Container */}
      <div className="space-y-2">
        {filteredLogs.map(log => {
          const isSuccess = log.status_code >= 200 && log.status_code < 300;
          return (
            <div key={log.id} className="border border-gray-200 bg-white transition-all text-sm rounded-sm">
              {/* Card Header Section */}
              <div 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-gray-50 gap-3 sm:gap-4" 
                onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
              >
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  {isSuccess ? <CheckCircle2 className="text-green-600 h-4 w-4 shrink-0" /> : <XCircle className="text-red-600 h-4 w-4 shrink-0" />}
                  <span className={`font-mono text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    HTTP {log.status_code}
                  </span>
                  <span className="text-gray-500 text-[11px] sm:text-xs font-mono break-all">{new Date(log.created_at).toISOString()}</span>
                </div>
                <div className="text-left sm:text-right text-[11px] sm:text-xs text-gray-400 font-mono sm:shrink-0">
                  {log.execution_time_ms} ms
                </div>
              </div>

              {/* Expansion Code Drawer with Wrapper Controls */}
              {expandedLogId === log.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 font-mono text-xs text-slate-800 w-full overflow-hidden">
                  <p className="font-semibold mb-2 text-gray-500">// Upstream Server Response Body Signature:</p>
                  <pre className="whitespace-pre-wrap break-all bg-white border border-gray-100 p-3 rounded text-[11px] sm:text-xs text-slate-700 max-w-full max-h-96 overflow-y-auto shadow-inner">
                    {log.response || 'Empty transmission sequence returned.'}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}