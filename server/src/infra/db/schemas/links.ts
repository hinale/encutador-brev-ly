import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const links = pgTable(
  'links',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    originalUrl: text('original_url').notNull(),
    shortUrl: text('short_url').notNull().unique(),
    accessCount: integer('access_count').notNull().default(0),
    description: text('description'),
    previewImageUrl: text('preview_image_url'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('links_created_at_idx').on(table.createdAt)],
)
