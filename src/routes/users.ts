import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  // rota teste
  app.get('/', async () => {
    const users = await knex('users').select('*')

    return { users }
  })

  app.post('/', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserSchema.parse(request.body)

    const user = await knex('users').insert({
      user_id: randomUUID(),
      name,
      email,
    })

    return reply.status(201).send(user)
  })
}
