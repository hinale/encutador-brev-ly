import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

const CARD_CLASS_NAME = 'w-full rounded-lg bg-gray-100 p-6 text-gray-600'

export function Card({ className = '', ...props }: CardProps) {
  return <div className={`${CARD_CLASS_NAME} ${className}`} {...props} />
}
