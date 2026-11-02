'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/hub', label: 'Learning Hub' },
  { href: '/community', label: 'Community' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setDropdownOpen(false)
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xl font-bold tracking-tight"
            aria-label="BuildSphere home"
          >
            <span className="text-orange-500">Build</span>
            <span className="text-gray-900">Sphere</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'text-orange-500 bg-orange-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-500 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                >
                  {initials}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <p className="px-4 py-2 text-xs text-gray-500 truncate border-b border-gray-100">
                      {user.email}
                    </p>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/recommended"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Recommended
                    </Link>
                    <Link
                      href="/my-applications"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Applications
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <Link
                      href="/post-opportunity"
                      className="block px-4 py-2 text-sm text-orange-600 font-medium hover:bg-orange-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      + Post Opportunity
                    </Link>
                    <Link
                      href="/business/manage"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Manage Listings
                    </Link>
                    <Link
                      href="/payments"
                      className="block px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 flex items-center justify-between"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>Payments Test</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-semibold">Test</span>
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'text-orange-500 bg-orange-50'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 space-y-2">
            {user ? (
              <>
                <p className="text-xs text-gray-500 truncate px-1">{user.email}</p>
                <Link href="/profile" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                  Dashboard
                </Link>
                <Link href="/my-applications" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                  My Applications
                </Link>
                <Link href="/post-opportunity" className="block px-3 py-2 rounded-lg text-sm text-orange-600 font-medium hover:bg-orange-50">
                  + Post Opportunity
                </Link>
                <Link href="/business/manage" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                  Manage Listings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
