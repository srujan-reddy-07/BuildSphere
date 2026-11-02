import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import type { Opportunity } from '@/types/database';

interface OpportunityCardProps {
  opportunity: Opportunity;
  companyName?: string;
}

const TYPE_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
  job: 'primary',
  internship: 'default',
  freelance: 'warning',
  project: 'success',
};

const TYPE_LABELS: Record<string, string> = {
  job: 'Full-Time Job',
  internship: 'Internship',
  freelance: 'Freelance',
  project: 'Real-World Project',
};

export default function OpportunityCard({ opportunity, companyName = 'Partner Company' }: OpportunityCardProps) {
  const isExpired = opportunity.deadline && new Date(opportunity.deadline) < new Date();
  const visibleSkills = (opportunity.required_skills ?? []).slice(0, 4);
  const remainingCount = (opportunity.required_skills ?? []).length - visibleSkills.length;

  return (
    <Card hover className="p-5 flex flex-col justify-between h-full border border-gray-100 transition-all hover:border-orange-200">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {companyName}
            </span>
            <Link href={`/opportunities/${opportunity.id}`} className="block group">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                {opportunity.title}
              </h3>
            </Link>
          </div>
          <Badge variant={TYPE_COLORS[opportunity.type] ?? 'default'}>
            {TYPE_LABELS[opportunity.type] ?? opportunity.type}
          </Badge>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {opportunity.is_remote ? (
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              🌐 Remote
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
              📍 {opportunity.location || 'India'}
            </span>
          )}

          {(opportunity.stipend_min || opportunity.stipend_max) && (
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              ₹{opportunity.stipend_min?.toLocaleString('en-IN') ?? 0}
              {opportunity.stipend_max ? ` - ₹${opportunity.stipend_max.toLocaleString('en-IN')}` : '+'}
            </span>
          )}
        </div>

        {visibleSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {visibleSkills.map((skill) => (
              <Badge key={skill} variant="default" className="text-xs bg-gray-100 text-gray-700">
                {skill}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <span className="text-xs text-gray-400 self-center font-medium">
                +{remainingCount} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div>
          {opportunity.deadline && (
            <span className={isExpired ? 'text-red-500 font-semibold' : ''}>
              {isExpired ? 'Expired: ' : 'Deadline: '} {formatDate(opportunity.deadline)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/opportunities/${opportunity.id}`}
            className="text-gray-600 hover:text-gray-900 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Details
          </Link>
          <Link
            href={`/opportunities/${opportunity.id}/apply`}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-3 py-1.5 rounded-md shadow-sm transition-colors text-xs"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </Card>
  );
}

