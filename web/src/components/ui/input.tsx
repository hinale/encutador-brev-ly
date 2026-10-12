import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
}

const INPUT_CLASS_NAME =
  'h-12 w-full rounded-lg border bg-white px-4 text-md text-gray-600 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50'

const INPUT_BORDER_CLASS_NAME = {
  default: 'border-gray-300 focus:border-blue-base',
  invalid: 'border-danger focus:border-danger',
} as const

export function Input({
  className = '',
  invalid = false,
  ...props
}: InputProps) {
  const borderClassName = invalid
    ? INPUT_BORDER_CLASS_NAME.invalid
    : INPUT_BORDER_CLASS_NAME.default

  return (
    <input
      className={`${INPUT_CLASS_NAME} ${borderClassName} ${className}`}
      aria-invalid={invalid}
      {...props}
    />
  )
}
