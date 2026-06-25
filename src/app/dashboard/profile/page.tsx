'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Key, Fingerprint, Mail, User, Edit2, Check, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

// Manual Dummy Loading UI
function ProfileLoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 px-1 pb-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-[#EFEFEC] rounded-lg" />
        <div className="h-4 w-96 bg-[#EFEFEC]/60 rounded-md" />
      </div>
      <div className="bg-white rounded-3xl border border-[#EFEFEC]/80 overflow-hidden">
        <div className="p-8 border-b border-[#EFEFEC]/60 flex gap-4">
          <div className="h-14 w-14 rounded-2xl bg-[#EFEFEC]" />
          <div className="space-y-2 pt-1">
            <div className="h-5 w-40 bg-[#EFEFEC] rounded-lg" />
            <div className="h-3 w-60 bg-[#EFEFEC]/60 rounded-md" />
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="h-4 w-full bg-[#EFEFEC] rounded" />
          <div className="h-4 w-full bg-[#EFEFEC] rounded" />
        </div>
      </div>
    </div>
  );
}

function ProfileUI({
  name, email, id, isEditing, newName, isUpdating, 
  setNewName, handleUpdateName, setIsEditing
}: {
  name: string; email: string; id: string; isEditing: boolean;
  newName: string; isUpdating: boolean; setNewName: (val: string) => void;
  handleUpdateName: () => Promise<void>; setIsEditing: (val: boolean) => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-8 px-1 pb-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#283711]">Account Identity</h2>
        <p className="text-sm font-medium text-[#BDBDBB] mt-1">Manage infrastructure context credentials and operational environments</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EFEFEC]/80 shadow-[0_10px_40px_rgba(40,55,17,0.01)] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[#EFEFEC]/60 flex flex-col sm:flex-row sm:items-center gap-4 bg-gradient-to-b from-[#EFEFEC]/10 to-transparent">
          <div className="h-14 w-14 rounded-2xl bg-[#9EE970]/20 border border-[#9EE970]/30 flex items-center justify-between text-center shrink-0">
            <Fingerprint className="h-6 w-6 text-[#283711] mx-auto" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#283711]">{name}</h3>
            <p className="text-xs font-mono text-[#BDBDBB] mt-0.5 break-all">UID: {id}</p>
          </div>
        </div>

        <div className="divide-y divide-[#EFEFEC]/60 p-2 md:p-4 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 min-h-[4.5rem]">
            <span className="font-bold text-[#283711]/50 text-xs uppercase tracking-wider font-mono shrink-0">Operator Name</span>
            {isEditing ? (
              <div className="flex items-center gap-2 w-full sm:w-auto sm:max-w-md flex-1 justify-end">
                <input 
                  type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  disabled={isUpdating}
                  className="w-full sm:w-64 font-mono text-sm px-3 py-1.5 rounded-xl border border-[#EFEFEC] bg-[#EFEFEC]/30 text-[#283711] focus:outline-none focus:border-[#9EE970] focus:bg-white transition-all"
                />
                <button 
                  onClick={handleUpdateName} disabled={isUpdating || !newName.trim()}
                  className="p-2 rounded-xl bg-[#9EE970] text-[#283711] hover:bg-[#89d45c] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdating ? <div className="h-4 w-4 border-2 border-t-transparent border-[#283711] rounded-full animate-spin" /> : <Check className="h-4 w-4" />}
                </button>
                <button onClick={() => { setIsEditing(false); setNewName(name); }} disabled={isUpdating} className="p-2 rounded-xl bg-[#EFEFEC]/60 text-[#283711] hover:bg-[#EFEFEC] active:scale-95 transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="font-mono text-[#283711] font-medium flex items-center justify-end gap-4">
                <span className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-[#BDBDBB]" /> {name}</span>
                <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-lg text-[#BDBDBB] hover:text-[#283711] hover:bg-[#EFEFEC]/40 transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-1">
            <span className="font-bold text-[#283711]/50 text-xs uppercase tracking-wider font-mono">Email Context</span>
            <span className="font-mono text-[#283711] font-medium flex items-center gap-2 break-all"><Mail className="h-3.5 w-3.5 text-[#BDBDBB]" /> {email}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-1">
            <span className="font-bold text-[#283711]/50 text-xs uppercase tracking-wider font-mono">Security State</span>
            <span className="font-mono text-[#283711] font-medium flex items-center gap-2"><Key className="h-3.5 w-3.5 text-[#BDBDBB]" /> Managed via Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        const { data: dbUser } = await supabase.from('users').select('name').eq('uid', user.id).single();
        const currentName = dbUser?.name || 'Anonymous Operator';
        setProfile({ id: user.id, email: user.email || '', name: currentName });
        setNewName(currentName);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    }
    fetchUserData();
  }, [supabase]);

  const handleUpdateName = async () => {
    if (!profile || !newName.trim()) return;
    try {
      setIsUpdating(true);
      const { error } = await supabase.from('users').update({ name: newName.trim() }).eq('uid', profile.id);
      if (error) throw error;
      setProfile({ ...profile, name: newName.trim() });
      setIsEditing(false);
      toast.success('Identity updated!');
    } catch (e: any) { toast.error('Failed to save.'); } 
    finally { setIsUpdating(false); }
  };

  if (loading) {
    return <ProfileLoadingSkeleton />;
  }

  return (
    <ProfileUI 
      name={profile?.name || ''} 
      email={profile?.email || ''} 
      id={profile?.id || ''} 
      isEditing={isEditing} 
      newName={newName} 
      isUpdating={isUpdating} 
      setNewName={setNewName} 
      handleUpdateName={handleUpdateName} 
      setIsEditing={setIsEditing} 
    />
  );
}