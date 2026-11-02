/**
 * lib/ai.ts
 * Claude API integration for AI-powered features in BuildSphere.
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder-anthropic-key',
})

const MODEL = 'claude-sonnet-4-5'

// ---------------------------------------------------------------------------
// Profile Summary
// ---------------------------------------------------------------------------

/**
 * Generate a professional 2-3 sentence profile summary based on user data.
 * Returns a plain text string ready to display in the profile bio section.
 */
export async function generateProfileSummary(data: {
  name: string
  skills: string[]
  experience_years: number
  city: string
  availability: string
}): Promise<string> {
  const { name, skills, experience_years, city, availability } = data

  const skillsList = skills.length > 0 ? skills.join(', ') : 'various skills'
  const expLabel =
    experience_years === 0
      ? 'a fresher'
      : experience_years === 1
        ? '1 year of experience'
        : `${experience_years} years of experience`

  const availabilityLabel = availability.replace(/_/g, ' ')

  const prompt = `You are a professional career coach helping Indian professionals create compelling profile summaries for a talent network called BuildSphere.

Write a professional 2-3 sentence profile summary for the following person. The summary should be written in the first person, sound natural and confident, highlight their skills and experience, and mention their availability. Do not include any markdown formatting or bullet points — return only plain text.

Details:
- Name: ${name}
- Skills: ${skillsList}
- Experience: ${expLabel}
- City: ${city}, India
- Availability: ${availabilityLabel}

Return only the profile summary text, nothing else.`

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text.trim()
    }

    return `${name} is a skilled professional with expertise in ${skillsList} based in ${city}, India.`
  } catch (error) {
    console.error('[generateProfileSummary] Claude API error:', error)
    // Graceful fallback
    return `${name} is a skilled professional with expertise in ${skillsList} based in ${city}, India. ${
      experience_years > 0
        ? `With ${expLabel}, they bring hands-on knowledge to every project.`
        : 'As a fresher, they are eager to apply their skills in real-world projects.'
    } Currently available for ${availabilityLabel} opportunities.`
  }
}

// ---------------------------------------------------------------------------
// Skill Suggestions
// ---------------------------------------------------------------------------

/**
 * Suggest 5 relevant skills based on the user's existing skills and an optional target role.
 * Returns an array of skill name strings.
 */
export async function suggestSkillsWithAI(
  existingSkills: string[],
  targetRole?: string
): Promise<string[]> {
  const existingList =
    existingSkills.length > 0 ? existingSkills.join(', ') : 'none specified'
  const roleContext = targetRole
    ? `Their target role is: ${targetRole}.`
    : 'No specific target role has been specified.'

  const prompt = `You are a career advisor for an Indian talent network called BuildSphere. A user wants to improve their skill set.

Current skills: ${existingList}
${roleContext}

Suggest exactly 5 skills that would be most valuable for this person to learn next. Consider what complementary skills are in demand in the Indian job market for their profile. Return ONLY a valid JSON array of 5 skill name strings, with no additional text, explanation, or markdown. Example format: ["Skill One", "Skill Two", "Skill Three", "Skill Four", "Skill Five"]`

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 128,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API')
    }

    // Extract JSON array from the response (handle potential surrounding text)
    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON array found in Claude response')
    }

    const parsed: unknown = JSON.parse(jsonMatch[0])

    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === 'string')
    ) {
      // Deduplicate against existing skills (case-insensitive) and return up to 5
      const existing = new Set(existingSkills.map((s) => s.toLowerCase().trim()))
      return (parsed as string[])
        .filter((s) => !existing.has(s.toLowerCase().trim()))
        .slice(0, 5)
    }

    throw new Error('Parsed value is not a string array')
  } catch (error) {
    console.error('[suggestSkillsWithAI] Claude API error:', error)

    // Graceful fallback: return generic in-demand Indian market skills
    const fallbackPool = [
      'TypeScript',
      'Python',
      'React',
      'Node.js',
      'SQL',
      'Docker',
      'AWS',
      'Communication',
      'Project Management',
      'Data Analysis',
    ]
    const existingNorm = new Set(existingSkills.map((s) => s.toLowerCase().trim()))
    return fallbackPool
      .filter((s) => !existingNorm.has(s.toLowerCase().trim()))
      .slice(0, 5)
  }
}
