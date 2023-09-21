import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcrypt'

import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email } = createUserSchema.parse(request.body)

    await knex('users').insert({
      user_id: randomUUID(),
      name,
      email,
    })
  })
}
