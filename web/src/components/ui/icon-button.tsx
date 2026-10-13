import type { ButtonHTMLAttributes } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

const ICON_BUTTON_CLASS_NAME =
  'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-transparent bg-gray-200 text-gray-600 transition-colors hover:border-blue-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-base disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-transparent'

export function IconButton({
  className = '',
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`${ICON_BUTTON_CLASS_NAME} ${className}`}
      {...props}
    />
  )
}
