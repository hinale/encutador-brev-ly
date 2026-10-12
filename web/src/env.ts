import { z } from 'zod'
import { InvalidEnvironmentError } from './errors/invalid-environment-error'

const environmentSchema = z.object({
  VITE_FRONTEND_URL: z.string().url(),
  VITE_BACKEND_URL: z.string().url(),
})

export type Environment = z.infer<typeof environmentSchema>

function formatEnvironmentError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const field = issue.path.join('.')

      if (field.length === 0) {
        return issue.message
      }

      return `${field}: ${issue.message}`
    })
    .join('; ')
}

export function loadEnvironment(
  source: Record<string, string | undefined>,
): Environment {
  const parsed = environmentSchema.safeParse(source)

  if (!parsed.success) {
    throw new InvalidEnvironmentError(formatEnvironmentError(parsed.error))
  }

  return parsed.data
}

export const env = loadEnvironment({
  VITE_FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
})
