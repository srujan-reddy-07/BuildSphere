/**
 * __tests__/matching.test.ts
 * Comprehensive Jest tests for lib/matching pure utility functions.
 */

import {
  computeMatchScore,
  rankOpportunities,
  suggestSkills,
} from '@/lib/matching'

// ---------------------------------------------------------------------------
// computeMatchScore
// ---------------------------------------------------------------------------

describe('computeMatchScore', () => {
  it('returns 100 when userSkills contains ALL required skills', () => {
    const score = computeMatchScore(
      ['React', 'TypeScript', 'Node.js'],
      ['React', 'TypeScript', 'Node.js'],
    )
    expect(score).toBe(100)
  })

  it('returns 0 when there is no overlap between user and required skills', () => {
    const score = computeMatchScore(
      ['Photoshop', 'Illustrator'],
      ['Python', 'Django', 'PostgreSQL'],
    )
    expect(score).toBe(0)
  })

  it('returns 50 (neutral) when requiredSkills is empty', () => {
    const score = computeMatchScore(['React', 'TypeScript'], [])
    expect(score).toBe(50)
  })

  it('returns 50 when requiredSkills is empty and userSkills is also empty', () => {
    const score = computeMatchScore([], [])
    expect(score).toBe(50)
  })

  it('returns correct percentage for partial overlap — 2 of 4 required = 50', () => {
    const score = computeMatchScore(
      ['React', 'TypeScript'],
      ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    )
    expect(score).toBe(50)
  })

  it('returns correct percentage for partial overlap — 1 of 4 required = 25', () => {
    const score = computeMatchScore(
      ['React'],
      ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    )
    expect(score).toBe(25)
  })

  it('returns correct percentage for partial overlap — 3 of 4 required = 75', () => {
    const score = computeMatchScore(
      ['React', 'TypeScript', 'Node.js'],
      ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    )
    expect(score).toBe(75)
  })

  it('is case-insensitive — user has "javascript", required has "JavaScript"', () => {
    const score = computeMatchScore(
      ['javascript', 'css'],
      ['JavaScript', 'CSS'],
    )
    expect(score).toBe(100)
  })

  it('is case-insensitive — user has "REACT", required has "react"', () => {
    const score = computeMatchScore(['REACT'], ['react'])
    expect(score).toBe(100)
  })

  it('handles mixed-case in both lists correctly', () => {
    const score = computeMatchScore(
      ['TypeScript', 'nodejs'],
      ['typescript', 'Node.js'],
    )
    // "TypeScript" matches "typescript" ✓; "nodejs" does NOT match "Node.js" (different after trim)
    expect(score).toBe(50)
  })

  it('handles duplicates in userSkills gracefully — does not inflate score', () => {
    const score = computeMatchScore(
      ['React', 'React', 'React'],
      ['React', 'TypeScript'],
    )
    expect(score).toBe(50)
  })

  it('handles duplicates in requiredSkills gracefully', () => {
    // 'React' appears 3 times in required; user has React → 3/3 = 100
    const score = computeMatchScore(['React'], ['React', 'React', 'React'])
    expect(score).toBe(100)
  })

  it('trims whitespace when comparing skills', () => {
    const score = computeMatchScore(['  React  '], [' React '])
    expect(score).toBe(100)
  })

  it('returns 0 when userSkills is empty and there are required skills', () => {
    const score = computeMatchScore([], ['React', 'TypeScript'])
    expect(score).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// rankOpportunities
// ---------------------------------------------------------------------------

/** Helper to build a minimal opportunity object */
function makeOpp(
  id: string,
  title: string,
  required_skills: string[],
  type = 'job',
  location: string | null = 'Bangalore',
  business: { name: string } | null = { name: 'Acme Corp' },
) {
  return { id, title, type, location, required_skills, business }
}

describe('rankOpportunities', () => {
  const opps = [
    makeOpp('1', 'Backend Engineer', ['Node.js', 'PostgreSQL', 'Docker']),
    makeOpp('2', 'Frontend Developer', ['React', 'TypeScript', 'CSS']),
    makeOpp('3', 'Full-Stack Developer', ['React', 'Node.js', 'TypeScript', 'PostgreSQL']),
    makeOpp('4', 'No-skill listing', []),
  ]

  it('returns an array sorted by matchScore descending', () => {
    const userSkills = ['React', 'TypeScript', 'CSS']
    const ranked = rankOpportunities(opps, userSkills)
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].matchScore).toBeGreaterThanOrEqual(ranked[i + 1].matchScore)
    }
  })

  it('returns all opportunities regardless of score (no filtering)', () => {
    const ranked = rankOpportunities(opps, ['React'])
    expect(ranked).toHaveLength(opps.length)
  })

  it('includes correct matchedSkills for each result', () => {
    const userSkills = ['React', 'TypeScript']
    const ranked = rankOpportunities(opps, userSkills)
    const frontend = ranked.find((r) => r.opportunityId === '2')!
    expect(frontend.matchedSkills.sort()).toEqual(['React', 'TypeScript'])
  })

  it('includes correct missingSkills for each result', () => {
    const userSkills = ['React', 'TypeScript']
    const ranked = rankOpportunities(opps, userSkills)
    const frontend = ranked.find((r) => r.opportunityId === '2')!
    expect(frontend.missingSkills).toEqual(['CSS'])
  })

  it('computes correct matchScore per opportunity', () => {
    const userSkills = ['React', 'TypeScript', 'CSS']
    const ranked = rankOpportunities(opps, userSkills)
    const frontend = ranked.find((r) => r.opportunityId === '2')!
    const fullstack = ranked.find((r) => r.opportunityId === '3')!
    expect(frontend.matchScore).toBe(100) // 3/3
    expect(fullstack.matchScore).toBe(50) // 2/4
  })

  it('handles empty userSkills — all skill-bearing opps score 0; empty-skill opp scores 50', () => {
    const ranked = rankOpportunities(opps, [])
    const noSkill = ranked.find((r) => r.opportunityId === '4')!
    const backend = ranked.find((r) => r.opportunityId === '1')!
    expect(noSkill.matchScore).toBe(50)
    expect(backend.matchScore).toBe(0)
  })

  it('uses business.name for company; falls back to "Unknown" when business is null', () => {
    const oppWithNoCompany = makeOpp('99', 'Solo Gig', ['React'], 'freelance', 'Remote', null)
    const ranked = rankOpportunities([oppWithNoCompany], ['React'])
    expect(ranked[0].company).toBe('Unknown')
  })

  it('uses "Remote" for location when opportunity location is null', () => {
    const remoteOpp = makeOpp('88', 'Remote Job', [], 'job', null)
    const ranked = rankOpportunities([remoteOpp], [])
    expect(ranked[0].location).toBe('Remote')
  })

  it('breaks ties alphabetically by title', () => {
    const tiedOpps = [
      makeOpp('a', 'Zebra Corp Role', ['React'], 'job'),
      makeOpp('b', 'Alpha Corp Role', ['React'], 'job'),
    ]
    const ranked = rankOpportunities(tiedOpps, ['React'])
    expect(ranked[0].title).toBe('Alpha Corp Role')
    expect(ranked[1].title).toBe('Zebra Corp Role')
  })

  it('returns empty array when no opportunities provided', () => {
    const ranked = rankOpportunities([], ['React'])
    expect(ranked).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// suggestSkills
// ---------------------------------------------------------------------------

describe('suggestSkills', () => {
  const opportunities = [
    { required_skills: ['React', 'TypeScript', 'CSS'] },
    { required_skills: ['React', 'Node.js', 'PostgreSQL'] },
    { required_skills: ['React', 'TypeScript', 'Docker'] },
    { required_skills: ['Python', 'Django', 'PostgreSQL'] },
    { required_skills: ['Node.js', 'Docker', 'AWS'] },
  ]

  it('returns skills not already present in userSkills', () => {
    const suggestions = suggestSkills(opportunities, ['React', 'TypeScript'])
    expect(suggestions).not.toContain('React')
    expect(suggestions).not.toContain('TypeScript')
  })

  it('sorts suggestions by frequency descending', () => {
    // React×3, TypeScript×2, Node.js×2, CSS×1, PostgreSQL×2, Docker×2, Python×1, Django×1, AWS×1
    // User has nothing → top suggestions by frequency
    const suggestions = suggestSkills(opportunities, [])
    // React should be first (appears 3 times)
    expect(suggestions[0]).toBe('React')
  })

  it('respects the default topN limit of 5', () => {
    const suggestions = suggestSkills(opportunities, [])
    expect(suggestions.length).toBeLessThanOrEqual(5)
  })

  it('respects a custom topN limit', () => {
    const suggestions = suggestSkills(opportunities, [], 3)
    expect(suggestions).toHaveLength(3)
  })

  it('returns empty array when all frequent skills are already in userSkills', () => {
    const allSkills = [
      'React', 'TypeScript', 'CSS', 'Node.js', 'PostgreSQL',
      'Docker', 'Python', 'Django', 'AWS',
    ]
    const suggestions = suggestSkills(opportunities, allSkills)
    expect(suggestions).toEqual([])
  })

  it('performs case-insensitive deduplication — "react" user skill blocks "React" from suggestions', () => {
    const suggestions = suggestSkills(opportunities, ['react'])
    expect(suggestions.map((s) => s.toLowerCase())).not.toContain('react')
  })

  it('handles opportunities with empty required_skills arrays', () => {
    const mixedOpps = [
      { required_skills: ['React', 'TypeScript'] },
      { required_skills: [] },
      { required_skills: ['Node.js'] },
    ]
    const suggestions = suggestSkills(mixedOpps, [])
    expect(suggestions).toContain('React')
    expect(suggestions).toContain('TypeScript')
  })

  it('returns empty array when opportunities list is empty', () => {
    const suggestions = suggestSkills([], ['React'])
    expect(suggestions).toEqual([])
  })

  it('topN of 0 returns empty array', () => {
    const suggestions = suggestSkills(opportunities, [], 0)
    expect(suggestions).toEqual([])
  })
})
