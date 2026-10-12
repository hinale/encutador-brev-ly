import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const BUTTON_BASE_CLASS_NAME =
  'inline-flex h-12 cursor-pointer items-center justify-center rounded-lg px-4 text-md font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-base disabled:cursor-not-allowed disabled:opacity-50'

const BUTTON_VARIANT_CLASS_NAME: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-base text-white hover:bg-blue-dark disabled:hover:bg-blue-base',
  secondary:
    'border border-transparent bg-gray-200 text-gray-500 hover:border-blue-base disabled:hover:border-transparent',
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const variantClassName = BUTTON_VARIANT_CLASS_NAME[variant]

  return (
    <button
      type={type}
      className={`${BUTTON_BASE_CLASS_NAME} ${variantClassName} ${className}`}
      {...props}
    />
  )
}
