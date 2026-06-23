'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Plus, Trash } from 'lucide-react';

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

    // JSON Structural Check if payload is supplied
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
      ...(jobType === 'Recurring' 
        ? { cron: computeCron() } 
        : { run_at: new Date(runAt).toISOString() }
      )
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/jobs`, {
        method: 'POST',
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
        console.error("Backend validation trace rejection:", errorDetails);
        alert(`Server Rejected Configuration Parameters (HTTP 400): ${errorDetails}`);
      }
    } catch (err) {
      console.error("Network communication pipeline fault:", err);
      alert("Unable to establish communication channel with backend server application node.");
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 px-1">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-black">Schedule New Job</h2>
        <p className="text-xs md:text-sm text-gray-500 mt-1">Configure target infrastructure delivery automation parameters</p>
      </div>

      <form onSubmit={handleSubmit} className="border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm space-y-6 text-sm">
        
        {/* Core Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-black mb-1.5 md:mb-2">Job Identifier Name</label>
            <input type="text" required placeholder="Data Aggregator Process" className="w-full border border-gray-200 p-3 md:p-2.5 text-sm md:text-xs focus:border-black focus:outline-none bg-white" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block font-medium text-black mb-1.5 md:mb-2">Destination URL Endpoint</label>
            <input type="url" required placeholder="https://api.service.com/hook" className="w-full border border-gray-200 p-3 md:p-2.5 font-mono text-sm md:text-xs focus:border-black focus:outline-none bg-white" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
        </div>

        {/* HTTP Protocol Method and Execution Topology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-black mb-1.5 md:mb-2">HTTP Request Method</label>
            <select 
              className="w-full border border-gray-200 p-3 md:p-2.5 bg-white text-sm md:text-xs focus:border-black focus:outline-none h-[46px] md:h-[42px]" 
              value={method} 
              onChange={e => setMethod(e.target.value)}
            >
              {HTTP_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-black mb-1.5 md:mb-2">Execution Topology Model</label>
            <div className="flex space-x-2 h-[46px] md:h-[42px]">
              {['Recurring', 'One-Off'].map(type => (
                <button key={type} type="button" onClick={() => setJobType(type as any)} className={`flex-1 text-center px-4 font-medium border text-xs tracking-wide transition-all ${jobType === type ? 'bg-black text-white border-black' : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conditional Scheduling Parameters */}
        {jobType === 'Recurring' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-black mb-1.5 md:mb-2">Interval Metric Target</label>
              <select 
                className="w-full border border-gray-200 p-3 md:p-2.5 bg-white text-sm md:text-xs font-mono focus:border-black focus:outline-none h-[46px] md:h-auto" 
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
            <div>
              <label className="block font-medium text-black mb-1.5 md:mb-2">Timezone Scope Environment</label>
              <select 
                className="w-full border border-gray-200 p-3 md:p-2.5 bg-white text-sm md:text-xs focus:border-black focus:outline-none h-[46px] md:h-auto" 
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
          <div>
            <label className="block font-medium text-black mb-1.5 md:mb-2">Target Universal Date & Time execution</label>
            <input type="datetime-local" required className="w-full md:w-auto border border-gray-200 p-3 md:p-2.5 text-sm md:text-xs focus:border-black focus:outline-none bg-white" value={runAt} onChange={e => setRunAt(e.target.value)} />
          </div>
        )}

        {/* Optional JSON Payload field */}
        {method !== 'GET' && (
          <div>
            <label className="block font-medium text-black mb-1.5 md:mb-2">JSON Request Body Payload (Optional)</label>
            <textarea 
              placeholder={`{\n  "status": "active",\n  "trigger": "automation"\n}`}
              rows={4}
              className="w-full border border-gray-200 p-3 md:p-2.5 font-mono text-sm md:text-xs focus:border-black focus:outline-none bg-white resize-y"
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>
        )}

        {/* Dynamic Key-Value Request Headers Stack */}
        <div className="space-y-3">
          <label className="block font-medium text-black">Forwarding Authorization & Headers</label>
          <div className="space-y-3 md:space-y-2">
            {headers.map((hdr, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 border sm:border-0 border-gray-100 p-3 sm:p-0 rounded-md sm:rounded-none bg-gray-50/50 sm:bg-transparent">
                <div className="flex flex-1 space-x-2">
                  <input type="text" placeholder="X-API-Key" className="w-1/2 sm:flex-1 border border-gray-200 p-3 sm:p-2 font-mono text-sm md:text-xs focus:border-black focus:outline-none bg-white" value={hdr.key} onChange={e => updateHeader(i, 'key', e.target.value)} />
                  <input type="text" placeholder="Value Secret" className="w-1/2 sm:flex-1 border border-gray-200 p-3 sm:p-2 font-mono text-sm md:text-xs focus:border-black focus:outline-none bg-white" value={hdr.value} onChange={e => updateHeader(i, 'value', e.target.value)} />
                </div>
                <div className="flex justify-end pt-1 sm:pt-0 pl-0 sm:pl-1">
                  <button type="button" onClick={() => removeHeader(i)} className="text-gray-400 hover:text-red-500 p-2 sm:p-1 hover:bg-red-50 sm:hover:bg-transparent rounded" aria-label="Delete header line">
                    <Trash className="h-4 w-4 md:h-4 md:w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addHeader} className="flex items-center justify-center space-x-1.5 border border-gray-200 w-full sm:w-auto px-4 py-3 sm:py-1.5 text-xs font-medium hover:bg-gray-50 mt-2 transition-colors">
            <Plus className="h-3 w-3" /> <span>Add Header Attribute</span>
          </button>
        </div>

        {/* Submit Action Block */}
        <div className="pt-2">
          <button type="submit" className="w-full bg-black py-3.5 md:py-3 font-medium text-white hover:bg-neutral-800 text-sm tracking-wide transition-all shadow-sm">
            Provision Worker to Engine
          </button>
        </div>
      </form>
    </div>
  );
}