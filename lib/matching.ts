/**
 * lib/matching.ts
 * Skill-matching utilities for BuildSphere opportunity ranking.
 */

export interface SkillMatch {
  opportunityId: string
  title: string
  company: string
  type: string
  location: string
  requiredSkills: string[]
  userSkills: string[]
  matchScore: number       // 0-100
  matchedSkills: string[]  // intersection of user skills & required skills
  missingSkills: string[]  // required skills the user lacks
}

/**
 * Compute a match score between a user's skill list and an opportunity's required skills.
 *
 * Score = (matched / required) * 100, capped at 100.
 * If the opportunity has no required skills, score = 50 (neutral).
 * Comparison is case-insensitive.
 */
export function computeMatchScore(
  userSkills: string[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 50

  const normalised = userSkills.map((s) => s.toLowerCase().trim())
  const matched = requiredSkills.filter((req) =>
    normalised.includes(req.toLowerCase().trim())
  )

  const score = (matched.length / requiredSkills.length) * 100
  return Math.min(100, Math.round(score))
}

/**
 * Given a list of opportunities and a user's skills, return SkillMatch[] sorted
 * by matchScore descending.
 */
export function rankOpportunities(
  opportunities: Array<{
    id: string
    title: string
    business?: { name: string } | null
    type: string
    location?: string | null
    required_skills: string[]
  }>,
  userSkills: string[]
): SkillMatch[] {
  const normalisedUser = userSkills.map((s) => s.toLowerCase().trim())

  const matches: SkillMatch[] = opportunities.map((opp) => {
    const requiredSkills = opp.required_skills ?? []

    const matchedSkills = requiredSkills.filter((req) =>
      normalisedUser.includes(req.toLowerCase().trim())
    )
    const missingSkills = requiredSkills.filter(
      (req) => !normalisedUser.includes(req.toLowerCase().trim())
    )

    return {
      opportunityId: opp.id,
      title: opp.title,
      company: opp.business?.name ?? 'Unknown',
      type: opp.type,
      location: opp.location ?? 'Remote',
      requiredSkills,
      userSkills,
      matchScore: computeMatchScore(userSkills, requiredSkills),
      matchedSkills,
      missingSkills,
    }
  })

  // Sort by matchScore descending; break ties alphabetically by title
  matches.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
    return a.title.localeCompare(b.title)
  })

  return matches
}

/**
 * Given the user's current skills, suggest skills they are missing that appear
 * frequently across open opportunities.
 *
 * Returns top `topN` skills not already in userSkills, sorted by frequency desc.
 */
export function suggestSkills(
  opportunities: Array<{ required_skills: string[] }>,
  userSkills: string[],
  topN: number = 5
): string[] {
  const normalisedUser = new Set(userSkills.map((s) => s.toLowerCase().trim()))

  // Count how often each skill appears across all opportunities
  const frequency: Map<string, { canonical: string; count: number }> = new Map()

  for (const opp of opportunities) {
    for (const skill of opp.required_skills ?? []) {
      const key = skill.toLowerCase().trim()
      if (normalisedUser.has(key)) continue // already known
      if (frequency.has(key)) {
        frequency.get(key)!.count += 1
      } else {
        frequency.set(key, { canonical: skill, count: 1 })
      }
    }
  }

  // Sort by frequency desc and return canonical forms
  return Array.from(frequency.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
    .map((entry) => entry.canonical)
}
