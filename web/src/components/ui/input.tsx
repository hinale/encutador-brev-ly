import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

const INPUT_CLASS_NAME =
  'h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-md text-gray-600 outline-none placeholder:text-gray-400 focus:border-blue-base disabled:cursor-not-allowed disabled:opacity-50'

export function Input({ className = '', ...props }: InputProps) {
  return <input className={`${INPUT_CLASS_NAME} ${className}`} {...props} />
}
