'use client';
import { useEffect, useState, use, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Zap, Activity, ShieldAlert, CornerDownRight } from 'lucide-react';
import Link from 'next/link';

interface Log {
  id: string;
  created_at: string;
  status_code: number;
  response: string;
  execution_time_ms: number;
}

// Manual skeleton loading component
function LoadingState() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-1 pb-12 animate-pulse">
      <div className="h-8 w-48 bg-[#EFEFEC] rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[#EFEFEC] rounded-3xl" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-[#EFEFEC]/50 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function tryParseMangledJson(str: any): any {
  if (typeof str !== 'string') return str;
  const trimmed = str.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      if (trimmed.startsWith('{') && !trimmed.endsWith('}')) {
        return JSON.parse(trimmed + '}');
      }
    } catch {}
  }
  return null;
}

function PropertyValueFormatter({ value }: { value: any }) {
  const normalizedValue = useMemo(() => {
    let current = value;
    let attempts = 0;
    while (typeof current === 'string' && attempts < 3) {
      const parsed = tryParseMangledJson(current);
      if (parsed !== null && typeof parsed === 'object') {
        current = parsed;
        attempts++;
      } else {
        break;
      }
    }
    return current;
  }, [value]);

  if (normalizedValue === null || normalizedValue === undefined) {
    return <span className="text-[#BDBDBB] italic font-mono text-[11px]">none</span>;
  }

  if (Array.isArray(normalizedValue)) {
    return (
      <div className="flex flex-wrap gap-1 font-mono text-[11px] text-[#283711]/90">
        {normalizedValue.map((item, index) => (
          <div key={index} className="bg-[#EFEFEC]/40 px-2 py-0.5 rounded-lg border border-[#EFEFEC]/60 max-w-full break-all">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof normalizedValue === 'object') {
    return (
      <div className="space-y-2 border-l-2 border-[#EFEFEC] pl-3 mt-1.5">
        {Object.entries(normalizedValue).map(([subKey, subValue]) => (
          <div key={subKey} className="text-[11px]">
            <span className="text-[#BDBDBB] font-mono font-bold mr-1.5">{subKey}:</span>
            <PropertyValueFormatter value={subValue} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className="font-mono text-[#283711] text-[11px] break-all leading-relaxed whitespace-pre-wrap font-medium">
      {String(normalizedValue)}
    </span>
  );
}

function StructuredResponse({ rawString }: { rawString: string }) {
  const cleanData = useMemo(() => {
    if (!rawString) return null;
    let parsed = tryParseMangledJson(rawString);
    if (typeof parsed === 'string') {
      const secondaryParse = tryParseMangledJson(parsed);
      if (secondaryParse) parsed = secondaryParse;
    }
    if (!parsed || typeof parsed !== 'object') {
      try {
        const match = rawString.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {
        try {
          const lines = rawString.split(/[,\n]/);
          const mockObj: Record<string, string> = {};
          lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
              const k = parts[0].replace(/["'{}\s]/g, '');
              const v = parts.slice(1).join(':').trim();
              if (k) mockObj[k] = v;
            }
          });
          if (Object.keys(mockObj).length > 0) return mockObj;
        } catch {}
      }
    }
    return parsed;
  }, [rawString]);

  if (!cleanData || typeof cleanData !== 'object') {
    return (
      <div className="bg-[#EFEFEC]/10 border border-[#EFEFEC] p-4 rounded-xl text-[11px] font-mono text-[#283711]/70 whitespace-pre-wrap break-all shadow-inner">
        {rawString || 'Empty raw system transmission sequence sequence returned.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 bg-[#EFEFEC]/20 p-1.5 rounded-2xl border border-[#EFEFEC]/50">
      {Object.entries(cleanData).map(([key, value]) => (
        <div key={key} className="bg-white border border-[#EFEFEC]/60 p-3.5 rounded-xl shadow-[0_4px_12px_rgba(40,55,17,0.01)] flex flex-col md:flex-row md:items-start gap-2">
          <span className="text-[10px] text-[#283711]/50 font-mono uppercase tracking-wider block min-w-[165px] font-bold pt-0.5 shrink-0 break-all">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </span>
          <div className="flex-1 min-w-0 w-full">
            <PropertyValueFormatter value={value} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LogsViewContent({
  analytics,
  statusFilter,
  setStatusFilter,
  filteredLogs,
  expandedLogId,
  setExpandedLogId
}: {
  analytics: any;
  statusFilter: string;
  setStatusFilter: (val: any) => void;
  filteredLogs: Log[];
  expandedLogId: string | null;
  setExpandedLogId: (val: string | null) => void;
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-1 pb-12 overflow-x-hidden">
      <div className="space-y-4">
        <Link href="/dashboard" className="inline-flex items-center space-x-2 text-xs font-bold text-[#BDBDBB] hover:text-[#283711] transition-colors uppercase tracking-widest group">
          <ArrowLeft className="h-3.5 w-3.5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Return to Workspace</span>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#283711]">Execution Logs Traces</h2>
          <p className="text-sm font-medium text-[#BDBDBB] mt-1 font-mono">Last system pulse logged: {analytics.last}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 text-sm">
        <div className="bg-white rounded-3xl p-5 border border-[#EFEFEC]/60 shadow-[0_20px_50px_rgba(40,55,17,0.02)] relative overflow-hidden flex flex-col justify-between min-h-[115px]">
          <Activity className="absolute right-4 top-4 h-4 w-4 text-[#283711]/10" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#283711]/50">Total Run Cycles</p>
          <div>
            <p className="text-2xl font-extrabold text-[#283711] font-mono tracking-tight">{analytics.total}</p>
            <span className="text-[10px] text-[#BDBDBB] font-mono font-medium">Aggregated log events</span>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-5 border border-[#EFEFEC]/60 shadow-[0_20px_50px_rgba(40,55,17,0.02)] relative overflow-hidden flex flex-col justify-between min-h-[115px]">
          <Zap className="absolute right-4 top-4 h-4 w-4 text-[#89d45c]/20" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#283711]/50">Success Rate</p>
          <div>
            <p className="text-2xl font-extrabold text-[#89d45c] font-mono tracking-tight">{analytics.rate}%</p>
            <span className="text-[10px] text-[#BDBDBB] font-mono font-medium">{analytics.total - analytics.failureCount} passed successfully</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EFEFEC]/60 shadow-[0_20px_50px_rgba(40,55,17,0.02)] relative overflow-hidden flex flex-col justify-between min-h-[115px]">
          <Clock className="absolute right-4 top-4 h-4 w-4 text-blue-200" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#283711]/50">Average Latency</p>
          <div>
            <p className="text-2xl font-extrabold text-[#283711] font-mono tracking-tight">
              {analytics.avgLatency} <span className="text-xs font-bold text-[#BDBDBB]">ms</span>
            </p>
            <span className="text-[10px] text-[#BDBDBB] font-mono font-medium">Mean roundtrip cost profile</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EFEFEC]/60 shadow-[0_20px_50px_rgba(40,55,17,0.02)] relative overflow-hidden flex flex-col justify-between min-h-[115px]">
          <ShieldAlert className="absolute right-4 top-4 h-4 w-4 text-red-200" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#283711]/50">Active Fault Incidents</p>
          <div>
            <p className="text-2xl font-extrabold text-red-500 font-mono tracking-tight">{analytics.failureCount}</p>
            <span className="text-[10px] text-[#BDBDBB] font-mono font-medium">Outages & exceptions logged</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFEFEC]/60 pb-3 gap-4">
        <div className="flex items-center space-x-3">
          <Activity className="h-4 w-4 text-[#283711]/60" />
          <h3 className="font-bold text-base text-[#283711]">Trace Sequence Output</h3>
        </div>
        <select 
          className="w-full sm:w-auto border border-[#9EE970]/30 rounded-xl px-3 py-2 bg-[#9EE970]/10 text-xs font-bold text-[#283711] focus:border-[#9EE970] focus:ring-2 focus:ring-[#9EE970]/20 focus:outline-none transition-all cursor-pointer h-9 appearance-none" 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value as any)}
        >
          <option value="All" className="bg-white text-[#283711]">All Status Codes</option>
          <option value="Success" className="bg-white text-[#283711]">Success (2xx)</option>
          <option value="Failed" className="bg-white text-[#283711]">Failed (4xx/5xx)</option>
        </select>
      </div>

      <div className="space-y-3.5">
        {filteredLogs.map(log => {
          const isSuccess = log.status_code >= 200 && log.status_code < 300;
          const isExpanded = expandedLogId === log.id;
          return (
            <div key={log.id} className={`bg-white border rounded-2xl shadow-[0_10px_30px_rgba(40,55,17,0.01)] overflow-hidden transition-all duration-300 ${isExpanded ? 'border-[#9EE970] ring-2 ring-[#9EE970]/5' : 'border-[#EFEFEC]/70'}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 cursor-pointer hover:bg-[#EFEFEC]/10 gap-3 sm:gap-4 transition-colors ${isExpanded ? 'bg-[#9EE970]/5' : ''}`} onClick={() => setExpandedLogId(isExpanded ? null : log.id)}>
                <div className="flex items-center gap-3 min-w-0">
                  {isSuccess ? <CheckCircle2 className="text-[#89d45c] h-4 w-4 shrink-0" /> : <XCircle className="text-red-500 h-4 w-4 shrink-0" />}
                  <span className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-wide shrink-0 ${isSuccess ? 'bg-[#9EE970]/10 text-[#283711]' : 'bg-red-50 text-red-700'}`}>HTTP {log.status_code}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 font-mono text-xs border-t sm:border-0 pt-2 sm:pt-0 border-[#EFEFEC]/60">
                  <span className="text-[#BDBDBB] font-medium">{new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wide border ${log.execution_time_ms > 800 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-[#EFEFEC]/50 text-[#283711]/70 border-[#EFEFEC]'}`}>{log.execution_time_ms} ms</span>
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-[#EFEFEC]/60 bg-gradient-to-b from-[#EFEFEC]/10 to-white p-5 w-full overflow-hidden space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#283711]/50 font-mono uppercase tracking-wider">
                    <CornerDownRight className="h-3.5 w-3.5 text-[#BDBDBB]" />
                    <span>Parsed Execution Parameter Registry</span>
                  </div>
                  <StructuredResponse rawString={log.response} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function JobLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Success' | 'Failed'>('All');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    const { data, error } = await supabase.from('job_logs').select('*').eq('job_id', jobId).order('created_at', { ascending: false });
    if (error) console.error("Supabase Error:", error.message);
    else if (data) setLogs(data);
    setLoading(false);
  }, [supabase, jobId]);
      
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const analytics = useMemo(() => {
    if (logs.length === 0) return { total: 0, rate: 0, last: 'N/A', avgLatency: 0, failureCount: 0 };
    const successCount = logs.filter(l => l.status_code >= 200 && l.status_code < 300).length;
    const totalLatency = logs.reduce((acc, curr) => acc + (curr.execution_time_ms || 0), 0);
    return {
      total: logs.length,
      rate: Math.round((successCount / logs.length) * 100),
      last: new Date(logs[0].created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      avgLatency: Math.round(totalLatency / logs.length),
      failureCount: logs.length - successCount
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (statusFilter === 'Success') return log.status_code >= 200 && log.status_code < 300;
      if (statusFilter === 'Failed') return log.status_code >= 400 || log.status_code < 200;
      return true;
    });
  }, [logs, statusFilter]);

  if (loading) return <LoadingState />;

  return (
    <LogsViewContent 
      analytics={analytics}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      filteredLogs={filteredLogs}
      expandedLogId={expandedLogId}
      setExpandedLogId={setExpandedLogId}
    />
  );
}