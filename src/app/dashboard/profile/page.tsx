'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Check, X, Pencil, Copy, Lock, Shield } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone_number: string;
  phone_verified: boolean;
  avatar_url: string;
  date_of_birth: string;
  country: string;
  website: string;
}

function ProfileLoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 pb-12 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-[#EFEFEC] rounded-lg" />
        <div className="h-4 w-96 bg-[#EFEFEC]/60 rounded-md" />
      </div>
      <div className="h-40 bg-white rounded-3xl border border-[#EFEFEC] w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="h-24 bg-white rounded-2xl border border-[#EFEFEC]" />
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('name, phone_number, phone_verified, avatar_url, date_of_birth, country, website')
          .eq('uid', user.id)
          .single();

        if (error) throw error;

        setProfile({
          id: user.id,
          email: user.email || '',
          name: dbUser?.name || 'Anonymous Operator',
          phone_number: dbUser?.phone_number || '',
          phone_verified: dbUser?.phone_verified || false,
          avatar_url: dbUser?.avatar_url || '',
          date_of_birth: dbUser?.date_of_birth || '',
          country: dbUser?.country || '',
          website: dbUser?.website || '',
        });
      } catch (error) {
        console.error(error);
        toast.error("Error pulling infrastructure context parameters.");
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [supabase]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('UID copied to clipboard');
  };

  const startEditing = (fieldName: keyof UserProfile, currentVal: any) => {
    setEditingField(fieldName);
    setEditValue(currentVal || '');
  };

  const handleUpdateField = async (fieldName: keyof UserProfile) => {
    if (!profile) return;
    try {
      setIsUpdating(true);
      const payloadValue = editValue.trim();
      
      const { error } = await supabase
        .from('users')
        .update({ [fieldName]: payloadValue || null })
        .eq('uid', profile.id);

      if (error) throw error;

      setProfile({ ...profile, [fieldName]: payloadValue });
      setEditingField(null);
      toast.success('Identity modified successfully.');
    } catch (e: any) {
      toast.error('Failed to update field.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <ProfileLoadingSkeleton />;
  if (!profile) return <div className="p-8 text-center text-sm font-mono text-red-500">Failed loading identity profile.</div>;

  const avatarSource = profile.avatar_url.trim() 
    ? profile.avatar_url 
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}&backgroundColor=bcff95&textColor=283711`;

  const renderGridCard = (
    label: string, 
    fieldName: keyof UserProfile, 
    value: string, 
    inputType: string = 'text',
    editable: boolean = true
  ) => {
    const isThisFieldEditing = editingField === fieldName;

    return (
      <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-[#EFEFEC] flex items-center justify-between min-h-[96px] relative group transition-all duration-300">
        <div className="space-y-1.5 w-full pr-8">
          <span className="block font-semibold text-[#283711] text-[10px] tracking-[0.12em] uppercase font-mono opacity-80">
            {label}
          </span>
          
          {isThisFieldEditing ? (
            <div className="flex items-center gap-2 w-full mt-1">
              <input 
                type={inputType} 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)}
                disabled={isUpdating}
                className="w-full font-mono text-sm px-3 py-1.5 rounded-xl border border-[#EFEFEC] bg-[#EFEFEC]/40 text-[#283711] focus:outline-none focus:border-[#9EE970] focus:bg-white transition-all"
                autoFocus
              />
              <button 
                onClick={() => handleUpdateField(fieldName)} 
                disabled={isUpdating}
                className="p-2 rounded-xl bg-[#bcff95] text-[#283711] hover:bg-[#9EE970] transition-all shrink-0"
              >
                {isUpdating ? <div className="h-4 w-4 border-2 border-t-transparent border-[#283711] rounded-full animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
              <button 
                onClick={() => setEditingField(null)} 
                disabled={isUpdating} 
                className="p-2 rounded-xl bg-[#EFEFEC]/60 text-[#283711] hover:bg-[#EFEFEC] transition-all shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <span className="block font-mono text-sm font-medium text-[#283711] break-all">
              {value || <span className="text-[#BDBDBB] italic text-xs">Unspecified</span>}
            </span>
          )}
        </div>

        {editable && !isThisFieldEditing && (
          <button 
            onClick={() => startEditing(fieldName, value)}
            className="p-1.5 rounded-lg text-[#BDBDBB] hover:text-[#283711] hover:bg-[#EFEFEC]/50 transition-all shrink-0 absolute right-4 top-1/2 -translate-y-1/2"
          >
            <Pencil className="h-4 w-4 stroke-[1.5]" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 pb-12 antialiased selection:bg-[#bcff95]/40">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Page Title Row */}
      <div className="space-y-1">
        <h2 className="text-[28px] font-bold tracking-tight text-[#283711]">Account</h2>
       
      </div>

      {/* Main Large Header Identity Card */}
      <div className="bg-white rounded-[32px] border border-[#EFEFEC] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 relative">
        <div className="relative h-28 w-28 shrink-0">
          <div className="h-full w-full rounded-full bg-[#bcff95]/30 border border-[#bcff95]/40 flex items-center justify-center overflow-hidden shadow-sm">
            <img 
              src={avatarSource} 
              alt="Operator Identity Avatar" 
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`;
              }}
            />
          </div>
          {/* Centered button handle fix layout placement wrapper */}
          <button className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 bg-white border border-[#EFEFEC] text-[#283711] p-2 rounded-full shadow-sm hover:scale-105 transition-all flex items-center justify-center h-8 w-8">
            <Pencil className="h-3.5 w-3.5 stroke-[2]" />
          </button>
        </div>
        
        <div className="space-y-2.5">
          <h3 className="font-bold text-2xl text-[#283711] tracking-tight">{profile.name}</h3>
          <div className="inline-flex items-center gap-1.5 bg-[#EFEFEC]/50 border border-[#EFEFEC]/20 px-3 py-1.5 rounded-full text-xs font-mono text-[#283711]/80 max-w-full">
            <span className="text-[#BDBDBB]">UID:</span>
            <span className="truncate max-w-[180px] sm:max-w-xs">{profile.id}</span>
            <button onClick={() => copyToClipboard(profile.id)} className="text-[#BDBDBB] hover:text-[#283711] transition-colors ml-1">
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Parametric Grid Layout matching image spec */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {renderGridCard('Name', 'name', profile.name)}
        
        {renderGridCard('Phone ', 'phone_number', profile.phone_number, 'tel')}
        
       
        {renderGridCard('DOB', 'date_of_birth', profile.date_of_birth, 'date')}

        {renderGridCard('Geographic Zone', 'country', profile.country)}


        {renderGridCard('Email', 'email', profile.email, 'email')}

        
      </div>
    </div>
  );
}