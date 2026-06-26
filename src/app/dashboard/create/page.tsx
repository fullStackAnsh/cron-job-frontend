'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Globe, Key, Settings, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast'; // Installed toast utilities

const VALID_QSTASH_TIMEZONES = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC'
];

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function CreateJobPage() {
  const router = useRouter();
  const supabase = createClient();
 
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('POST');
  const [body, setBody] = useState('');
  const [jobType, setJobType] = useState<'Recurring' | 'One-Off'>('Recurring');
  const [frequency, setFrequency] = useState('hourly');
  const [runAt, setRunAt] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [loading, setLoading] = useState(false); // Added submit loader lock configuration

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
      ...(jobType === 'Recurring'
        ? { cron: computeCron() }
        : { run_at: new Date(runAt).toISOString() }
      )
    };

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
         setLoading(false);
        toast.success('Worker successfully provisioned to engine!');
        
        router.push('/dashboard');
        router.refresh();

      } else {
        const errorDetails = await res.text();
        console.error("Backend validation trace rejection:", errorDetails);
        toast.error(`Configuration parameters rejected: ${errorDetails}`);
        setLoading(false);
      }
    } catch (err) {
      console.error("Network communication pipeline fault:", err);
      toast.error("Unable to establish communication channel with backend server node.");
      setLoading(false);
    }
  };
 
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-1 pb-12">
      {/* Toast layout surface attachment engine */}
      <Toaster position="top-center" reverseOrder={false} />
     
      {/* Top Header Section */}
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#BDBDBB] hover:text-[#283711] transition-colors uppercase tracking-widest group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to active crons</span>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#283711]">Schedule New Job</h2>
          <p className="text-sm font-medium text-[#BDBDBB] mt-1">Configure target infrastructure delivery automation parameters</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-sm">
       
        {/* Section 1: Endpoint Configuration */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EFEFEC]/60 shadow-[0_20px_50px_rgba(40,55,17,0.02)] space-y-6">
          <div className="flex items-center space-x-3 pb-2 border-b border-[#EFEFEC]/60">
            <Settings className="h-4 w-4 text-[#283711]/60" />
            <h3 className="font-bold text-base text-[#283711]">Target Specification</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-bold text-xs uppercase tracking-wider text-[#283711]/70">Job Identifier Name</label>
              <input
                type="text"
                required
                placeholder="Data Aggregator Process"
                className="w-full border border-[#EFEFEC] rounded-2xl p-3.5 text-sm font-medium focus:border-[#9EE970] focus:ring-2 focus:ring-[#9EE970]/10 focus:outline-none bg-[#EFEFEC]/20 text-[#283711] placeholder-[#BDBDBB] transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs uppercase tracking-wider text-[#283711]/70">Destination URL Endpoint</label>
              <input
                type="url"
                required
                placeholder="https://api.service.com/hook"
                className="w-full border border-[#EFEFEC] rounded-2xl p-3.5 font-mono text-xs font-medium focus:border-[#9EE970] focus:ring-2 focus:ring-[#9EE970]/10 focus:outline-none bg-[#EFEFEC]/20 text-[#283711] placeholder-[#BDBDBB] transition-all"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-bold text-xs uppercase tracking-wider text-[#283711]/70">HTTP Request Method</label>
              <select
                className="w-full border border-[#EFEFEC] rounded-2xl p-3.5 bg-[#EFEFEC]/20 text-sm font-semibold text-[#283711] focus:border-[#9EE970] focus:ring-2 focus:ring-[#9EE970]/10 focus:outline-none h-[50px] transition-all appearance-none cursor-pointer"
                value={method}
                onChange={e => setMethod(e.target.value)}
              >
                {HTTP_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs uppercase tracking-wider text-[#283711]/70">Execution Topology Model</label>
              <div className="flex bg-[#EFEFEC]/40 p-1 rounded-2xl h-[50px] border border-[#EFEFEC]/60">
                {['Recurring', 'One-Off'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setJobType(type as any)}
                    className={`flex-1 text-center rounded-xl px-4 font-bold text-xs tracking-wide transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      jobType === type
                        ? 'bg-[#283711] text-white shadow-sm'
                        : 'text-[#283711]/60 hover:text-[#283711] hover:bg-[#EFEFEC]/40'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Scheduling & Parameters */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EFEFEC]/60 shadow-[0_20px_50px_rgba(40,55,17,0.02)] space-y-6">
          <div className="flex items-center space-x-3 pb-2 border-b border-[#EFEFEC]/60">
            <Zap className="h-4 w-4 text-[#283711]/60" />
            <h3 className="font-bold text-base text-[#283711]">Execution Intervals</h3>
          </div>

          {jobType === 'Recurring' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block font-bold text-xs uppercase tracking-wider text-[#283711]/70">Interval Metric Target</label>
                <select
                  className="w-full border border-[#EFEFEC] rounded-2xl p-3.5 bg-[#EFEFEC]/20 text-xs font-mono font-semibold text-[#283711] focus:border-[#9EE970] focus:ring-2 focus:ring-[#9EE970]/10 focus:outline-none h-[50px] transition-all cursor-pointer"
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
              <div className="space-y-2">
                <label className="block font-bold text-xs uppercase tracking-wider text-[#283711]/70">Timezone Scope Environment</label>
                <select
                  className="w-full border border-[#EFEFEC] rounded-2xl p-3.5 bg-[#EFEFEC]/20 text-xs font-semibold text-[#283711] focus:border-[#9EE970] focus:ring-2 focus:ring-[#9EE970]/10 focus:outline-none h-[50px] transition-all cursor-pointer"
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
            <div className="space-y-2 max-w-md">
              <label className="block font-bold text-xs uppercase tracking-wider text-[#283711]/70">Target Universal Date & Time execution</label>
              <input
                type="datetime-local"
                required
                className="w-full border border-[#EFEFEC] rounded-2xl p-3.5 text-sm font-semibold text-[#283711] focus:border-[#9EE970] focus:ring-2 focus:ring-[#9EE970]/10 focus:outline-none bg-[#EFEFEC]/20 transition-all"
                value={runAt}
                onChange={e => setRunAt(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Section 3: JSON request Payload overrides */}
        {method !== 'GET' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EFEFEC]/60 shadow-[0_20px_50px_rgba(40,55,17,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFEFEC]/60">
              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-[#283711]/60" />
                <h3 className="font-bold text-base text-[#283711]">JSON Request Body Payload</h3>
              </div>
              <span className="text-[10px] font-bold bg-[#EFEFEC] text-[#283711]/60 px-2 py-0.5 rounded-md uppercase tracking-wider">Optional</span>
            </div>
           
            <textarea
              placeholder={`{\n  "status": "active",\n  "trigger": "automation"\n}`}
              rows={5}
              className="w-full border border-[#EFEFEC] rounded-2xl p-4 font-mono text-xs font-medium focus:border-[#9EE970] focus:ring-2 focus:ring-[#9EE970]/10 focus:outline-none bg-[#EFEFEC]/10 text-[#283711] placeholder-[#BDBDBB] resize-y leading-relaxed"
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>
        )}

        {/* Section 4: Headers Registry Stack */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EFEFEC]/60 shadow-[0_20px_50px_rgba(40,55,17,0.02)] space-y-6">
          <div className="flex items-center space-x-3 pb-2 border-b border-[#EFEFEC]/60">
            <Key className="h-4 w-4 text-[#283711]/60" />
            <h3 className="font-bold text-base text-[#283711]">Forwarding Authorization & Headers</h3>
          </div>

          <div className="space-y-3">
            {headers.map((hdr, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#EFEFEC]/10 p-3 sm:p-0 sm:bg-transparent rounded-2xl border border-[#EFEFEC]/40 sm:border-0">
                <div className="flex flex-1 gap-3">
                  <input
                    type="text"
                    placeholder="X-API-Key"
                    className="w-1/2 sm:flex-1 border border-[#EFEFEC] rounded-xl p-3 font-mono text-xs font-semibold focus:border-[#9EE970] focus:outline-none bg-white text-[#283711] placeholder-[#BDBDBB]"
                    value={hdr.key}
                    onChange={e => updateHeader(i, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Value Secret"
                    className="w-1/2 sm:flex-1 border border-[#EFEFEC] rounded-xl p-3 font-mono text-xs font-semibold focus:border-[#9EE970] focus:outline-none bg-white text-[#283711] placeholder-[#BDBDBB]"
                    value={hdr.value}
                    onChange={e => updateHeader(i, 'value', e.target.value)}
                  />
                </div>
                <div className="flex justify-end items-center pl-1">
                  <button
                    type="button"
                    onClick={() => removeHeader(i)}
                    className="text-[#283711]/40 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"
                    aria-label="Delete header line"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addHeader}
            className="flex items-center justify-center space-x-2 border border-[#EFEFEC] bg-[#EFEFEC]/40 text-[#283711] rounded-xl w-full sm:w-auto px-4 py-2.5 text-xs font-bold hover:bg-[#EFEFEC] transition-colors"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add Header Attribute</span>
          </button>
        </div>

        {/* Global Blueprint Dispatch CTA button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9EE970] text-[#283711] hover:bg-[#89d45c] active:scale-[0.99] py-4 rounded-2xl font-bold text-sm tracking-wide shadow-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center"
          >
            {loading ? (
              <svg 
                className="animate-spin h-5 w-5 text-[#283711]" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Provision Worker to Engine'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}