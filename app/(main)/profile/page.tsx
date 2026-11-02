'use client';

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getProfileCompleteness } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkillTag } from '@/components/ui/SkillTag';
import { Card } from '@/components/ui/Card';
import type { Profile } from '@/types/database';

const INDIAN_CITIES = [
  'Ahmedabad', 'Bengaluru', 'Bhopal', 'Chennai', 'Coimbatore',
  'Delhi', 'Gurugram', 'Hyderabad', 'Indore', 'Jaipur',
  'Kochi', 'Kolkata', 'Lucknow', 'Mumbai', 'Nagpur',
  'Noida', 'Patna', 'Pune', 'Surat', 'Visakhapatnam',
];

const AVAILABILITY_OPTIONS = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'freelance', label: 'Freelance / Contract' },
  { value: 'not-available', label: 'Not available' },
] as const;

type AvailabilityType = 'full-time' | 'part-time' | 'freelance' | 'not-available';

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState<AvailabilityType>('full-time');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setUserId(user.id);

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<Profile>();

      if (p) {
        setFullName(p.full_name ?? '');
        setCity(p.city ?? '');
        setState(p.state ?? '');
        setBio(p.bio ?? '');
        setAvailability((p.availability as AvailabilityType) ?? 'full-time');
        setExperienceYears(p.experience_years ?? '');
        setAvatarUrl(p.avatar_url ?? null);
        if (Array.isArray(p.education)) {
          setEducation(
            (p.education as Array<{ institution: string; degree: string; year: string }>).map((e, i) => ({
              id: String(i),
              institution: e.institution,
              degree: e.degree,
              year: e.year,
            }))
          );
        }
      }

      // Load skills
      const { data: skillRows } = await supabase
        .from('user_skills')
        .select('skills(name)')
        .eq('user_id', user.id);
      if (skillRows) {
        setSkills(skillRows.map((s: any) => s.skills?.name).filter(Boolean));
      }

      setLoading(false);
    }
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { score: completeness } = getProfileCompleteness(
    {
      full_name: fullName,
      city,
      state,
      bio,
      avatar_url: avatarUrl,
      experience_years: experienceYears === '' ? 0 : experienceYears,
      availability,
      education,
    },
    skills
  );

  function addEducation() {
    setEducation((prev) => [
      ...prev,
      { id: Date.now().toString(), institution: '', degree: '', year: '' },
    ]);
  }

  function removeEducation(id: string) {
    setEducation((prev) => prev.filter((e) => e.id !== id));
  }

  function updateEducation(id: string, field: keyof Omit<EducationEntry, 'id'>, value: string) {
    setEducation((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setAvatarUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    }
    setAvatarUploading(false);
  }

  async function handleGenerateSummary() {
    if (!userId) return;
    setGeneratingSummary(true);
    try {
      const res = await fetch('/api/ai/profile-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          skills,
          experience_years: experienceYears,
          city,
          availability,
        }),
      });
      if (res.ok) {
        const { summary } = await res.json() as { summary: string };
        setBio(summary);
      }
    } catch {
      // silently fail
    } finally {
      setGeneratingSummary(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      city: city || null,
      state: state || null,
      bio: bio || null,
      availability,
      experience_years: experienceYears === '' ? null : experienceYears,
      avatar_url: avatarUrl || null,
      education: education.map(({ institution, degree, year }) => ({ institution, degree, year })),
    });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    // Save skills: delete then re-insert
    await supabase.from('user_skills').delete().eq('user_id', userId);
    for (const skillName of skills) {
      if (!skillName.trim()) continue;
      const { data: existingSkill } = await supabase
        .from('skills')
        .select('id')
        .ilike('name', skillName.trim())
        .maybeSingle();

      let skillId = existingSkill?.id;
      if (!skillId) {
        const { data: newSkill } = await supabase
          .from('skills')
          .insert({ name: skillName.trim() })
          .select('id')
          .single();
        skillId = newSkill?.id;
      }

      if (skillId) {
        await supabase.from('user_skills').insert({
          user_id: userId,
          skill_id: skillId,
          proficiency: 'intermediate',
        });
      }
    }

    setSaving(false);
    setSuccessMsg('Profile saved successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32" aria-label="Loading profile">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Keep your profile up to date to attract the best opportunities.</p>
      </div>

      {/* Completeness bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
          <span className={`text-sm font-bold ${completeness >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
            {completeness}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`h-2 rounded-full transition-all ${completeness >= 80 ? 'bg-green-500' : 'bg-orange-500'}`}
            style={{ width: `${completeness}%` }}
          />
        </div>
      </Card>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMsg && (
        <div role="status" className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Profile Photo</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${fullName} avatar`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-orange-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-2xl text-orange-500 font-bold border-2 border-orange-200">
                  {fullName ? fullName[0].toUpperCase() : '?'}
                </div>
              )}
            </div>
            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="text-sm"
              >
                {avatarUploading ? 'Uploading…' : 'Upload photo'}
              </Button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              aria-label="Upload profile photo"
              onChange={handleAvatarChange}
            />
          </div>
        </Card>

        {/* Basic Info */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Basic Information</h2>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Priya Sharma"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Select city…</option>
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <Input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                id="availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value as AvailabilityType)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {AVAILABILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <Input
                id="experienceYears"
                type="number"
                min={0}
                max={50}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="3"
              />
            </div>
          </div>
        </Card>

        {/* Bio */}
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Bio / Summary</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="text-xs px-3 py-1.5"
            >
              {generatingSummary ? 'Generating…' : '✨ Generate AI Summary'}
            </Button>
          </div>
          <div>
            <label htmlFor="bio" className="sr-only">Bio</label>
            <textarea
              id="bio"
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself, your work, and what you're looking for…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>
        </Card>

        {/* Skills */}
        <Card className="p-6 space-y-3">
          <h2 className="font-semibold text-gray-800">Skills (Press Enter to add)</h2>
          <SkillTag
            value={skills}
            onChange={setSkills}
            placeholder="Type a skill (e.g. React, Python, Figma) and press Enter…"
          />
        </Card>

        {/* Education */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Education</h2>
            <Button type="button" variant="secondary" onClick={addEducation} className="text-sm">
              + Add Entry
            </Button>
          </div>
          {education.length === 0 && (
            <p className="text-sm text-gray-400">No education entries yet. Add one above.</p>
          )}
          <div className="space-y-4">
            {education.map((entry) => (
              <div key={entry.id} className="flex flex-col sm:flex-row gap-3 items-start p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    type="text"
                    placeholder="Institution"
                    value={entry.institution}
                    onChange={(e) => updateEducation(entry.id, 'institution', e.target.value)}
                    aria-label="Institution name"
                  />
                  <Input
                    type="text"
                    placeholder="Degree"
                    value={entry.degree}
                    onChange={(e) => updateEducation(entry.id, 'degree', e.target.value)}
                    aria-label="Degree"
                  />
                  <Input
                    type="text"
                    placeholder="Year (e.g. 2022)"
                    value={entry.year}
                    onChange={(e) => updateEducation(entry.id, 'year', e.target.value)}
                    aria-label="Year of completion"
                    maxLength={4}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeEducation(entry.id)}
                  className="text-red-400 hover:text-red-600 mt-1 sm:mt-0 text-xs"
                  aria-label="Remove education entry"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving || !fullName}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8"
            aria-busy={saving}
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
