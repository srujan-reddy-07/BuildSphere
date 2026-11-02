'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

const TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'job', label: 'Jobs' },
  { value: 'internship', label: 'Internships' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'project', label: 'Real-World Projects' },
];

export default function OpportunitiesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [skills, setSkills] = useState(searchParams.get('skills') || '');

  useEffect(() => {
    setType(searchParams.get('type') || 'all');
    setLocation(searchParams.get('location') || '');
    setSkills(searchParams.get('skills') || '');
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (type && type !== 'all') params.set('type', type);
    if (location.trim()) params.set('location', location.trim());
    if (skills.trim()) params.set('skills', skills.trim());

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setType('all');
    setLocation('');
    setSkills('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = (type && type !== 'all') || location.trim() !== '' || skills.trim() !== '';

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Type select */}
        <div>
          <label htmlFor="filter-type" className="block text-xs font-medium text-gray-700 mb-1">
            Opportunity Type
          </label>
          <select
            id="filter-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location input */}
        <div>
          <label htmlFor="filter-location" className="block text-xs font-medium text-gray-700 mb-1">
            Location / Remote
          </label>
          <input
            id="filter-location"
            type="text"
            placeholder="e.g. Bangalore, Mumbai, Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full text-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Skills input */}
        <div>
          <label htmlFor="filter-skills" className="block text-xs font-medium text-gray-700 mb-1">
            Required Skills
          </label>
          <input
            id="filter-skills"
            type="text"
            placeholder="e.g. React, Python, UI/UX"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full text-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={applyFilters}
            isLoading={isPending}
            className="text-xs px-4"
          >
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={isPending}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </Button>
          )}
        </div>
        {hasActiveFilters && (
          <span className="text-xs text-orange-600 font-medium">Filters active</span>
        )}
      </div>
    </div>
  );
}

