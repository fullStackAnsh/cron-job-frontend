'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash, ArrowLeft, Settings, Calendar, RefreshCw, Layers } from 'lucide-react';
import Link from 'next/link';

const VALID_QSTASH_TIMEZONES = [
  'Asia/Kolkata', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'UTC'
];

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const getFrequencyFromCron = (cronExpr: string): string => {
  const pureCron = cronExpr.replace(/^CRON_TZ=\S+\s+/, '');
  switch (pureCron) {
    case '* * * * *': return 'minute';
    case '*/5 * * * *': return 'five-minutes';
    case '*/15 * * * *': return 'fifteen-minutes';
    case '0 * * * *': return 'hourly';
    case '0 */12 * * *': return 'twelve-hours';
    case '0 12 * * *': return 'daily';
    case '0 0 * * *': return 'midnight';
    case '0 0 * * 0': return 'weekly';
    case '0 0 1 * *': return 'monthly';
    default: return 'hourly';
  }
};

export default function EditJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const jobId = searchParams.get('id') || '';

  const [name, setName] = useState(searchParams.get('name') || '');
  const [url, setUrl] = useState(searchParams.get('url') || '');
  const [method, setMethod] = useState(searchParams.get('method') || 'POST');
  const [body, setBody] = useState('');
  const [jobType, setJobType] = useState<'Recurring' | 'One-Off'>('Recurring');
  const [frequency, setFrequency] = useState('hourly');
  const [runAt, setRunAt] = useState('');
  const [timezone, setTimezone] = useState(searchParams.get('timezone') || 'Asia/Kolkata');
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobDetails() {
      if (!jobId) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/jobs?id=${jobId}`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const currentJobs = await res.json();
        const targetJob = Array.isArray(currentJobs) ? currentJobs.find((j: any) => j.id === jobId) : null;

        if (targetJob) {
          setName(targetJob.name || '');
          setUrl(targetJob.url || '');
          setMethod(targetJob.method || 'POST');
          setBody(targetJob.body ? JSON.stringify(targetJob.body, null, 2) : '');
          setTimezone(targetJob.timezone || 'Asia/Kolkata');

          if (targetJob.cron) {
            setJobType('Recurring');
            setFrequency(getFrequencyFromCron(targetJob.cron));
          } else if (targetJob.run_at) {
            setJobType('One-Off');
            const localDate = new Date(targetJob.run_at);
            const offset = localDate.getTimezoneOffset() * 60000;
            const formattedTime = new Date(localDate.getTime() - offset).toISOString().slice(0, 16);
            setRunAt(formattedTime);
          }

          if (targetJob.headers && Object.keys(targetJob.headers).length > 0) {
            const mappedHeaders = Object.entries(targetJob.headers).map(([key, val]) => ({
              key, value: String(val)
            }));
            setHeaders(mappedHeaders);
          }
        }
      } catch (err) {
        console.error("Failure fetching deep model definitions", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobDetails();
  }, [jobId, supabase]);

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
  
  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    setHeaders(headers.map((hdr, i) => 
      i === index ? { ...hdr, [field]: value } : hdr
    ));
  };

  const computeCron = (): string => {
    switch (frequency) {
      case 'minute': return '* * * * *';
      case 'five-minutes': return '*/5 * * * *';
      case 'fifteen-minutes': return '*/15 * * * *';
      case 'hourly': return '0 * * * *';
      case 'twelve-hours': return '0 */12 * * *';
      case 'daily': return '0 12 * * *';
      case 'midnight': return '0 0 * * *';
      case 'weekly': return '0 0 * * 0';
      case 'monthly': return '0 0 1 * *';
      default: return '0 * * * *';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user || !session?.access_token) {
      alert("Authentication context unavailable. Please re-authenticate.");
      return;
    }

    let parsedPayload = null;
    if (body.trim() !== '') {
      try {
        parsedPayload = JSON.parse(body);
      } catch (err) {
        alert("Invalid JSON format in Request Payload field.");
        return;
      }
    }

    const computedHeaders = headers.reduce((acc, curr) => {
      if (curr.key.trim() !== '') {
        acc[curr.key.trim()] = curr.value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const payload = {
      user_id: user.id,
      name: name.trim(),
      url: url.trim(),
      method: method,
      body: parsedPayload,
      timezone: timezone,
      retries: 3,
      headers: computedHeaders,
      cron: jobType === 'Recurring' ? computeCron() : null,
      run_at: jobType === 'One-Off' && runAt ? new Date(runAt).toISOString() : null
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const errorDetails = await res.text();
        alert(`Server Rejected Configuration Changes: ${errorDetails}`);
      }
    } catch (err) {
      alert("Unable to establish communication channel with backend server configuration layer.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-6 h-6 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-neutral-400">Retrieving schedule telemetry variables...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-6 py-4">
      {/* Back to Workspace navigation bar wrapper */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-black transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> <span>Return to Workspace</span>
        </Link>
      </div>

      {/* Header Context Bar */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
          <Settings className="h-5 w-5 md:h-6 md:w-6 text-neutral-400" /> Modify Active Job Scope
        </h2>
        <p className="text-xs md:text-sm text-neutral-500 mt-1">Alter downstream endpoints, frequencies, and structural pipeline definitions</p>
      </div>

      {/* Form Card Layer */}
      <form onSubmit={handleSubmit} className="border border-neutral-200/80 bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-sm space-y-8 text-neutral-900">
        
        {/* Core Settings Information Block Section */}
        <div className="space-y-5">
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono text-neutral-400 border-b border-neutral-100 pb-2">01. Identity & Targets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">Job Identifier Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g., Stripe Sync Pipeline" 
                className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-neutral-50/30 outline-none" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">Destination URL Endpoint</label>
              <input 
                type="url" 
                required 
                placeholder="https://api.domain.com/v1/webhook" 
                className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 font-mono text-sm transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-neutral-50/30 outline-none" 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* HTTP Protocol Selection Element Options */}
        <div className="space-y-5">
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono text-neutral-400 border-b border-neutral-100 pb-2">02. Execution Topology</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">HTTP Request Method</label>
              <select 
                className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 bg-neutral-50/30 text-sm transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none cursor-pointer h-[42px]" 
                value={method} 
                onChange={e => setMethod(e.target.value)}
              >
                {HTTP_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">Execution Topology Model</label>
              <div className="flex p-1 bg-neutral-100/80 rounded-lg h-[42px]">
                {['Recurring', 'One-Off'].map(type => (
                  <button 
                    key={type} 
                    type="button" 
                    onClick={() => setJobType(type as any)} 
                    className={`flex-1 flex items-center justify-center space-x-1.5 rounded-md text-xs font-medium tracking-wide transition-all ${
                      jobType === type 
                        ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/40 font-semibold' 
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {type === 'Recurring' ? <RefreshCw className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Context Parameters Condition Layouts */}
        <div className="space-y-5">
          {jobType === 'Recurring' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-neutral-50/50 p-4 rounded-xl border border-neutral-100 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">Interval Metric Target</label>
                <select 
                  className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 bg-white text-sm font-mono transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none cursor-pointer h-[42px]" 
                  value={frequency} 
                  onChange={e => setFrequency(e.target.value)}
                >
                  <option value="minute">Every Minute (* * * * *)</option>
                  <option value="five-minutes">Every 5 Minutes (*/5 * * * *)</option>
                  <option value="fifteen-minutes">Every 15 Minutes (*/15 * * * *)</option>
                  <option value="hourly">Every Hour (0 * * * *)</option>
                  <option value="twelve-hours">Every 12 Hours (0 */12 * * *)</option>
                  <option value="daily">Every Day at Noon (0 12 * * *)</option>
                  <option value="midnight">Every Day at Midnight (0 0 * * *)</option>
                  <option value="weekly">Every Sunday at Midnight (0 0 * * 0)</option>
                  <option value="monthly">First Day of Month (0 0 1 * *)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">Timezone Scope Environment</label>
                <select 
                  className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 bg-white text-sm transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none cursor-pointer h-[42px]" 
                  value={timezone} 
                  onChange={e => setTimezone(e.target.value)}
                >
                  {VALID_QSTASH_TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 bg-neutral-50/50 p-4 rounded-xl border border-neutral-100 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">Target Universal Date & Time execution</label>
              <input 
                type="datetime-local" 
                required 
                className="border border-neutral-200 rounded-lg px-3.5 py-2 text-sm transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white outline-none h-[42px]" 
                value={runAt} 
                onChange={e => setRunAt(e.target.value)} 
              />
            </div>
          )}
        </div>

        {/* Optional JSON Target Requests Payload Element Configuration */}
        {method !== 'GET' && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold tracking-wider uppercase font-mono text-neutral-400 border-b border-neutral-100 pb-2 mb-3">03. Context Content</h3>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">JSON Request Body Payload (Optional)</label>
            <textarea 
              rows={5} 
              placeholder={`{\n  "status": "active"\n}`}
              className="w-full border border-neutral-200 rounded-lg p-3.5 font-mono text-sm transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-neutral-50/30 outline-none resize-y shadow-inner" 
              value={body} 
              onChange={e => setBody(e.target.value)} 
            />
          </div>
        )}

        {/* Dynamic Multi-Input Row Key Value Configuration Elements Stack */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono text-neutral-400 border-b border-neutral-100 pb-2 flex items-center gap-2">
            <Layers className="h-3.5 w-3.5" /> 04. Forwarding Authorization & Headers
          </h3>
          
          <div className="space-y-2.5">
            {headers.map((hdr, i) => (
              <div key={i} className="flex items-center space-x-3 group animate-in fade-in slide-in-from-top-1 duration-100">
                <div className="flex flex-1 gap-2">
                  <input 
                    type="text" 
                    placeholder="X-API-Key" 
                    className="w-1/2 border border-neutral-200 rounded-lg px-3.5 py-2 font-mono text-xs transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white outline-none" 
                    value={hdr.key} 
                    onChange={e => updateHeader(i, 'key', e.target.value)} 
                  />
                  <input 
                    type="text" 
                    placeholder="Value Secret" 
                    className="w-1/2 border border-neutral-200 rounded-lg px-3.5 py-2 font-mono text-xs transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white outline-none" 
                    value={hdr.value} 
                    onChange={e => updateHeader(i, 'value', e.target.value)} 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => removeHeader(i)} 
                  className="text-neutral-400 hover:text-red-500 p-2 hover:bg-red-50/80 rounded-lg border border-transparent hover:border-red-100 transition-colors shrink-0"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button 
            type="button" 
            onClick={addHeader} 
            className="inline-flex items-center space-x-2 border border-neutral-200 rounded-lg px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> <span>Add Header Attribute</span>
          </button>
        </div>

        {/* Global Action Footprints Submission Controls */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-end">
          <button 
            type="submit" 
            className="w-full sm:w-auto bg-neutral-900 px-6 py-3 font-semibold text-white hover:bg-neutral-800 text-xs tracking-wider uppercase rounded-lg transition-all shadow-sm active:scale-[0.98]"
          >
            Save Modifications & Reschedule
          </button>
        </div>
      </form>
    </div>
  );
}