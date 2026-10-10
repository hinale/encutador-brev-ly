import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/env'
import { schema } from './schemas'

// O postgres.js abre a conexão na primeira query. Se o banco estiver
// indisponível, o processo continua no listen e a primeira request responde 500.
export const pg = postgres(env.DATABASE_URL)

export const db = drizzle(pg, { schema })
