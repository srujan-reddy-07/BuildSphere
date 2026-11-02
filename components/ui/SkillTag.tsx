'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import clsx from 'clsx'

interface SkillTagProps {
  value: string[]
  onChange: (skills: string[]) => void
  placeholder?: string
  maxTags?: number
}

export function SkillTag({
  value,
  onChange,
  placeholder = 'Type a skill and press Enter',
  maxTags = 20,
}: SkillTagProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(raw: string) {
    const tag = raw.trim()
    if (!tag) return
    if (value.length >= maxTags) return
    if (value.map((v) => v.toLowerCase()).includes(tag.toLowerCase())) return
    onChange([...value, tag])
    setInputValue('')
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const atLimit = value.length >= maxTags

  return (
    <div
      role="group"
      aria-label="Skills input"
      className={clsx(
        'flex flex-wrap gap-1.5 min-h-[42px] w-full rounded-lg border bg-white px-3 py-2',
        'focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-transparent',
        'border-gray-300 transition-colors cursor-text'
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((skill, i) => (
        <span
          key={`${skill}-${i}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium"
        >
          {skill}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(i)
            }}
            aria-label={`Remove ${skill}`}
            className="hover:text-orange-900 focus:outline-none rounded-full"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      {!atLimit && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[140px] text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
          aria-label="Add skill"
        />
      )}
      {atLimit && (
        <span className="text-xs text-gray-400 self-center ml-1">
          Max {maxTags} skills
        </span>
      )}
    </div>
  )
}

export default SkillTag
