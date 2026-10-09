import { desc } from 'drizzle-orm'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeRight } from '@/shared/either'
import type { CreatedLink } from './create-link'

export async function listLinks(): Promise<
  Either<never, { links: CreatedLink[] }>
> {
  const links = await db
    .select()
    .from(schema.links)
    .orderBy(desc(schema.links.createdAt))

  return makeRight({ links })
}
