import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leadingIcon, trailingIcon, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <div
              className="absolute left-3 flex items-center pointer-events-none text-gray-400"
              aria-hidden="true"
            >
              {leadingIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            aria-invalid={error ? 'true' : undefined}
            className={clsx(
              'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
              'transition-colors',
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300',
              leadingIcon && 'pl-9',
              trailingIcon && 'pr-9',
              className
            )}
            {...props}
          />
          {trailingIcon && (
            <div
              className="absolute right-3 flex items-center pointer-events-none text-gray-400"
              aria-hidden="true"
            >
              {trailingIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export default Input
