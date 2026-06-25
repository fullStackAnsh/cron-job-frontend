'use client';
import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash, ArrowLeft, Calendar, RefreshCw, Layers } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

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

// Shimmer Loader Shell representing the actual layout architecture
function FormShimmer() {
  return (
    <div className="min-h-screen bg-[#F4F4F2] px-4 py-12 md:py-20 font-sans antialiased text-[#283711]">
      <div className="max-w-3xl mx-auto space-y-10 flex flex-col items-stretch">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="shimmer h-8 w-44 rounded-full bg-[#EFEFEC]" />
          <div className="pt-2 space-y-3 flex flex-col items-center">
            <div className="shimmer h-9 w-64 rounded-xl bg-[#EFEFEC]" />
            <div className="shimmer h-4 w-96 rounded-lg bg-[#EFEFEC]" />
          </div>
        </div>

        <div className="bg-white p-8 sm:p-10 md:p-12 rounded-[32px] md:rounded-[40px] shadow-sm space-y-12 border border-[#EFEFEC]">
          <div className="space-y-6">
            <div className="shimmer h-6 w-32 rounded bg-[#EFEFEC]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="shimmer h-[72px] rounded-[18px] bg-[#EFEFEC]" />
              <div className="shimmer h-[72px] rounded-[18px] bg-[#EFEFEC]" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="shimmer h-6 w-36 rounded bg-[#EFEFEC]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="shimmer h-[52px] rounded-[18px] bg-[#EFEFEC]" />
              <div className="shimmer h-[52px] rounded-[20px] bg-[#EFEFEC]" />
            </div>
          </div>
          <div className="pt-6 border-t border-[#EFEFEC] flex justify-center">
            <div className="shimmer h-12 w-full sm:w-64 rounded-full bg-[#EFEFEC]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EditJobForm() {
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
        toast.error("Failed to sync current job telemetry.");
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
      toast.error("Authentication context unavailable. Please re-authenticate.");
      return;
    }

    let parsedPayload = null;
    if (body.trim() !== '') {
      try {
        parsedPayload = JSON.parse(body);
      } catch (err) {
        toast.error("Invalid JSON format in Request Payload field.");
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

    const targetAction = fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(payload),
    });

    toast.promise(
      targetAction.then(async (res) => {
        if (!res.ok) {
          const errorDetails = await res.text();
          throw new Error(errorDetails || "Server rejected configuration alterations.");
        }
        router.push('/dashboard');
        router.refresh();
      }),
      {
        loading: 'Updating scheduled target schema...',
        success: 'Pipeline scope successfully modified!',
        error: (err) => `${err.message}`,
      }
    );
  };

  if (loading) return <FormShimmer />;
  
  return (
    <div className="min-h-screen bg-[#F4F4F2] px-4 py-12 md:py-20 font-sans antialiased text-[#283711]">
      <div className="max-w-3xl mx-auto space-y-10 flex flex-col items-stretch">
        
        {/* Navigation & Header Group */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#BDBDBB] hover:text-[#283711] transition-colors bg-[#EFEFEC] px-4 py-2 rounded-full"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#283711]" /> <span>Return to Workspace</span>
          </Link>
          
          <div className="pt-2 space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#283711] flex items-center justify-center gap-3">
              Modify Active Job Scope
            </h2>
            <p className="text-xs md:text-sm text-[#BDBDBB] max-w-lg mx-auto">
              Alter downstream endpoints, frequencies, and structural pipeline definitions
            </p>
          </div>
        </div>

        {/* Primary Container Card */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-8 sm:p-10 md:p-12 rounded-[32px] md:rounded-[40px] shadow-sm space-y-12 border border-[#EFEFEC]"
        >
          {/* Section 01: Identity & Targets */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-[#EFEFEC] pb-3">
              <span className="text-[11px] font-bold tracking-wider text-[#283711] bg-[#93E963] px-2.5 py-1 rounded-full">01</span>
              <h3 className="text-xs font-bold tracking-wider uppercase text-[#283711]">Identity & Targets</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#283711] uppercase tracking-wider px-1">Job Identifier Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Stripe Sync Pipeline" 
                  className="w-full bg-[#EFEFEC] border border-transparent rounded-[18px] px-5 py-3.5 text-sm transition-all focus:bg-white focus:border-[#283711] text-[#283711] placeholder-[#BDBDBB] outline-none font-medium" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#283711] uppercase tracking-wider px-1">Destination URL Endpoint</label>
                <input 
                  type="url" 
                  required 
                  placeholder="https://api.domain.com/v1/webhook" 
                  className="w-full bg-[#EFEFEC] border border-transparent rounded-[18px] px-5 py-3.5 text-sm transition-all focus:bg-white focus:border-[#283711] text-[#283711] placeholder-[#BDBDBB] outline-none font-mono" 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Section 02: Execution Topology */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-[#EFEFEC] pb-3">
              <span className="text-[11px] font-bold tracking-wider text-[#283711] bg-[#93E963] px-2.5 py-1 rounded-full">02</span>
              <h3 className="text-xs font-bold tracking-wider uppercase text-[#283711]">Execution Topology</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#283711] uppercase tracking-wider px-1">HTTP Request Method</label>
                <div className="relative">
                  <select 
                    className="w-full bg-[#EFEFEC] border border-transparent rounded-[18px] px-5 py-3.5 text-sm transition-all focus:bg-white focus:border-[#283711] text-[#283711] outline-none cursor-pointer appearance-none font-semibold h-[52px]" 
                    value={method} 
                    onChange={e => setMethod(e.target.value)}
                  >
                    {HTTP_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-[#283711] text-xs">
                    ↓
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#283711] uppercase tracking-wider px-1">Execution Topology Model</label>
                <div className="flex p-1.5 bg-[#EFEFEC] rounded-[20px] h-[52px]">
                  {['Recurring', 'One-Off'].map(type => (
                    <button 
                      key={type} 
                      type="button" 
                      onClick={() => setJobType(type as any)} 
                      className={`flex-1 flex items-center justify-center space-x-2 rounded-[14px] text-xs font-bold uppercase tracking-wider transition-all ${
                        jobType === type 
                          ? 'bg-[#93E963] text-[#283711] shadow-sm' 
                          : 'text-[#BDBDBB] hover:text-[#283711]'
                      }`}
                    >
                      {type === 'Recurring' ? <RefreshCw className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Frequency Parameters Block */}
          <div className="bg-[#EFEFEC]/40 p-6 rounded-[24px] border border-[#EFEFEC]">
            {jobType === 'Recurring' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#283711] uppercase tracking-wider px-1">Interval Metric Target</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-white border border-transparent rounded-[16px] px-4 py-3 text-xs font-medium transition-all focus:border-[#283711] text-[#283711] outline-none cursor-pointer appearance-none h-[46px]" 
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#283711] text-xs">
                      ↓
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#283711] uppercase tracking-wider px-1">Timezone Scope Environment</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-white border border-transparent rounded-[16px] px-4 py-3 text-xs font-medium transition-all focus:border-[#283711] text-[#283711] outline-none cursor-pointer appearance-none h-[46px]" 
                      value={timezone} 
                      onChange={e => setTimezone(e.target.value)}
                    >
                      {VALID_QSTASH_TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#283711] text-xs">
                      ↓
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="block text-[11px] font-bold text-[#283711] uppercase tracking-wider px-1">Target Execution Date & Time</label>
                <input 
                  type="datetime-local" 
                  required 
                  className="bg-white border border-transparent rounded-[16px] px-4 py-3 text-xs font-medium transition-all focus:border-[#283711] text-[#283711] outline-none h-[46px] min-w-[240px]" 
                  value={runAt} 
                  onChange={e => setRunAt(e.target.value)} 
                />
              </div>
            )}
          </div>

          {/* Section 03: Request Payload (Conditional) */}
          {method !== 'GET' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-[#EFEFEC] pb-3">
                <span className="text-[11px] font-bold tracking-wider text-[#283711] bg-[#93E963] px-2.5 py-1 rounded-full">03</span>
                <h3 className="text-xs font-bold tracking-wider uppercase text-[#283711]">Context Content</h3>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#283711] uppercase tracking-wider px-1">JSON Request Body Payload (Optional)</label>
                <textarea 
                  rows={5} 
                  placeholder={`{\n  "status": "active"\n}`}
                  className="w-full bg-[#EFEFEC] border border-transparent rounded-[24px] p-5 font-mono text-sm transition-all focus:bg-white focus:border-[#283711] text-[#283711] placeholder-[#BDBDBB] outline-none resize-y" 
                  value={body} 
                  onChange={e => setBody(e.target.value)} 
                />
              </div>
            </div>
          )}

          {/* Section 04: Headers Pipeline Block */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-[#EFEFEC] pb-3">
              <span className="text-[11px] font-bold tracking-wider text-[#283711] bg-[#93E963] px-2.5 py-1 rounded-full">04</span>
              <h3 className="text-xs font-bold tracking-wider uppercase text-[#283711] flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-[#283711]" /> Forwarding Authorization & Headers
              </h3>
            </div>
            
            <div className="space-y-3">
              {headers.map((hdr, i) => (
                <div key={i} className="flex items-center space-x-3 group animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="flex flex-1 gap-3">
                    <input 
                      type="text" 
                      placeholder="X-API-Key" 
                      className="w-1/2 bg-[#EFEFEC] border border-transparent rounded-[16px] px-4 py-3 text-xs font-mono text-[#283711] transition-all focus:bg-white focus:border-[#283711] outline-none placeholder-[#BDBDBB]" 
                      value={hdr.key} 
                      onChange={e => updateHeader(i, 'key', e.target.value)} 
                    />
                    <input 
                      type="text" 
                      placeholder="Value Secret" 
                      className="w-1/2 bg-[#EFEFEC] border border-transparent rounded-[16px] px-4 py-3 text-xs font-mono text-[#283711] transition-all focus:bg-white focus:border-[#283711] outline-none placeholder-[#BDBDBB]" 
                      value={hdr.value} 
                      onChange={e => updateHeader(i, 'value', e.target.value)} 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeHeader(i)} 
                    className="text-[#BDBDBB] hover:text-red-600 p-2.5 hover:bg-red-50 rounded-full transition-colors shrink-0"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={addHeader} 
              className="inline-flex items-center space-x-2 bg-[#EFEFEC] text-[#283711] hover:bg-[#93E963] transition-colors font-bold uppercase text-[10px] tracking-wider px-5 py-3 rounded-full"
            >
              <Plus className="h-3.5 w-3.5" /> <span>Add Header Attribute</span>
            </button>
          </div>

          {/* Submission Module Wrapper */}
          <div className="pt-6 border-t border-[#EFEFEC] flex items-center justify-center">
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-[#283711] hover:bg-[#283711]/90 px-10 py-4 font-bold text-white text-xs tracking-widest uppercase rounded-full transition-all active:scale-[0.98] shadow-sm"
            >
              Save 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditJobPage() {
  return (
    <Suspense fallback={<FormShimmer />}>
      <EditJobForm />
    </Suspense>
  );
}