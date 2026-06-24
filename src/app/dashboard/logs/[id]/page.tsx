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

// A highly defensive JSON repair function that attempts to close broken JSON strings/objects
function tryParseMangledJson(str: any): any {
  if (typeof str !== 'string') return str;
  
  const trimmed = str.trim();
  if (!trimmed) return null;

  // Tier 1: Try a standard parse
  try {
    return JSON.parse(trimmed);
  } catch {
    // Tier 2: If it's a truncated string, let's try to patch common structural breaks
    try {
      // If it looks like an unclosed object, try adding a closing brace
      if (trimmed.startsWith('{') && !trimmed.endsWith('}')) {
        return JSON.parse(trimmed + '}');
      }
    } catch {}
  }
  return null;
}

// Recursive structural formatter that displays whatever it can recover elegantly
function PropertyValueFormatter({ value }: { value: any }) {
  const normalizedValue = useMemo(() => {
    // Continually unpack stringified items if they are embedded JSON
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
    return <span className="text-gray-400 italic font-mono text-[11px]">none</span>;
  }

  // Handle Arrays
  if (Array.isArray(normalizedValue)) {
    return (
      <div className="flex flex-wrap gap-1 font-mono text-[11px] text-slate-700">
        {normalizedValue.map((item, index) => (
          <div key={index} className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200/60 max-w-full break-all">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </div>
        ))}
      </div>
    );
  }

  // Handle Nested Objects (Recursive Rendering)
  if (typeof normalizedValue === 'object') {
    return (
      <div className="space-y-2 border-l-2 border-slate-200 pl-3 mt-1.5">
        {Object.entries(normalizedValue).map(([subKey, subValue]) => (
          <div key={subKey} className="text-[11px]">
            <span className="text-slate-400 font-mono font-semibold mr-1.5">{subKey}:</span>
            <PropertyValueFormatter value={subValue} />
          </div>
        ))}
      </div>
    );
  }

  // Default string/number primitives
  return (
    <span className="font-mono text-slate-800 text-[11px] break-all leading-relaxed whitespace-pre-wrap">
      {String(normalizedValue)}
    </span>
  );
}

function StructuredResponse({ rawString }: { rawString: string }) {
  const cleanData = useMemo(() => {
    if (!rawString) return null;
    
    // Unpack top-level layer safely
    let parsed = tryParseMangledJson(rawString);
    
    // If the top layer was a string holding an object, unpack it once more
    if (typeof parsed === 'string') {
      const secondaryParse = tryParseMangledJson(parsed);
      if (secondaryParse) parsed = secondaryParse;
    }
    
    // If it's still not an object, let's look for partial fragments using regex as a nuclear fallback
    if (!parsed || typeof parsed !== 'object') {
      try {
        // Find things that look like JSON blocks inside broken strings
        const match = rawString.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {
        // Fallback to splitting key-values manually if it's a completely butchered log string
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

  // Absolute fallback UI container if everything else fails
  if (!cleanData || typeof cleanData !== 'object') {
    return (
      <div className="bg-white border border-gray-200 p-3 rounded text-[11px] font-mono text-gray-600 whitespace-pre-wrap break-all shadow-inner">
        {rawString || 'Empty raw system transmission sequence sequence returned.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 bg-white/50 p-1 rounded">
      {Object.entries(cleanData).map(([key, value]) => (
        <div key={key} className="bg-white border border-gray-200/80 p-3 rounded shadow-sm flex flex-col md:flex-row md:items-start gap-2">
          {/* Key Identifier */}
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block min-w-[150px] font-bold pt-0.5 shrink-0 break-all">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </span>
          {/* Managed Value Output */}
          <div className="flex-1 min-w-0 w-full">
            <PropertyValueFormatter value={value} />
          </div>
        </div>
      ))}
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

    const { data, error } = await supabase
      .from('job_logs')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
        
    if (error) {
      console.error("Supabase Error:", error.message);
    } else if (data) {
      setLogs(data);
    }
    
    setLoading(false);
  }, [supabase, jobId]);
      
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const analytics = useMemo(() => {
    if (logs.length === 0) return { total: 0, rate: 0, last: 'N/A', avgLatency: 0, failureCount: 0 };
    
    const successCount = logs.filter(l => l.status_code >= 200 && l.status_code < 300).length;
    const totalLatency = logs.reduce((acc, curr) => acc + (curr.execution_time_ms || 0), 0);
    
    return {
      total: logs.length,
      rate: Math.round((successCount / logs.length) * 100),
      last: new Date(logs[0].created_at).toLocaleString(),
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

  if (loading) return <div className="p-10 text-sm text-gray-500">Parsing upstream operational metrics trace...</div>;

  return (
    <div className="space-y-6 md:space-y-8 px-4 sm:px-6 md:px-0 max-w-full overflow-x-hidden">
      <Link href="/dashboard" className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-black">
        <ArrowLeft className="h-4 w-4" /> <span>Return to Workspace</span>
      </Link>

      {/* Metrics Summary Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="border border-gray-200 bg-white p-4 md:p-5 shadow-sm rounded-sm relative overflow-hidden">
          <Activity className="absolute right-3 top-3 h-4 w-4 text-gray-200" />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Run Cycles</p>
          <p className="mt-1 text-2xl font-bold text-black font-mono">{analytics.total}</p>
          <span className="text-[10px] text-gray-400 font-mono">Aggregated log events</span>
        </div>
        
        <div className="border border-gray-200 bg-white p-4 md:p-5 shadow-sm rounded-sm relative overflow-hidden">
          <Zap className="absolute right-3 top-3 h-4 w-4 text-green-200" />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Success Rate</p>
          <p className="mt-1 text-2xl font-bold text-green-600 font-mono">{analytics.rate}%</p>
          <span className="text-[10px] text-gray-400 font-mono">{analytics.total - analytics.failureCount} passed successfully</span>
        </div>

        <div className="border border-gray-200 bg-white p-4 md:p-5 shadow-sm rounded-sm relative overflow-hidden">
          <Clock className="absolute right-3 top-3 h-4 w-4 text-blue-200" />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Average Latency</p>
          <p className="mt-1 text-2xl font-bold text-slate-800 font-mono">{analytics.avgLatency} <span className="text-xs font-normal text-gray-400">ms</span></p>
          <span className="text-[10px] text-gray-400 font-mono">Mean roundtrip cost profile</span>
        </div>

        <div className="border border-gray-200 bg-white p-4 md:p-5 shadow-sm rounded-sm relative overflow-hidden">
          <ShieldAlert className="absolute right-3 top-3 h-4 w-4 text-red-200" />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Active Fault Incidents</p>
          <p className="mt-1 text-2xl font-bold text-red-600 font-mono">{analytics.failureCount}</p>
          <span className="text-[10px] text-gray-400 font-mono">Outages / unexpected code traces</span>
        </div>
      </div>

      {/* Filter Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold text-black">Execution Logs Traces</h3>
          <p className="text-xs text-gray-400 font-mono mt-0.5">Last system pulse logged: {analytics.last}</p>
        </div>
        <select 
          className="w-full sm:w-auto border border-gray-200 p-2 bg-white text-xs font-medium focus:outline-none rounded-sm" 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value as any)}
        >
          <option value="All">All Status Codes</option>
          <option value="Success">Success (2xx)</option>
          <option value="Failed">Failed (4xx/5xx)</option>
        </select>
      </div>

      {/* Logs Presentation Stack Layer */}
      <div className="space-y-2">
        {filteredLogs.map(log => {
          const isSuccess = log.status_code >= 200 && log.status_code < 300;
          const isExpanded = expandedLogId === log.id;
          return (
            <div key={log.id} className="border border-gray-200 bg-white transition-all text-sm rounded-sm shadow-sm">
              
              {/* Individual Header Row */}
              <div 
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-gray-50 gap-3 sm:gap-4 transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`} 
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  {isSuccess ? <CheckCircle2 className="text-green-600 h-4 w-4 shrink-0" /> : <XCircle className="text-red-600 h-4 w-4 shrink-0" />}
                  
                  <span className={`font-mono text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    HTTP {log.status_code}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 font-mono text-[11px] text-gray-400 border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                  <span className="text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${log.execution_time_ms > 800 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {log.execution_time_ms} ms
                  </span>
                </div>
              </div>

              {/* Enhanced Visual Structured Data Inspector Block */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/70 p-4 w-full overflow-hidden space-y-3 animate-in fade-in duration-100">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 font-mono">
                    <CornerDownRight className="h-3.5 w-3.5 text-gray-400" />
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