import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { CheckIfSessionIdExists } from '../middlewares/check-if-session-id-exists'
import { on } from 'node:events'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [CheckIfSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const meals = await knex('meals').where('session_id', sessionId).select('*')

    return { meals }
  })

  app.get('/:id', { preHandler: [CheckIfSessionIdExists] }, async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const { sessionId } = request.cookies

    const meal = await knex('meals').where({
      meal_id: id,
      session_id: sessionId,
    })

    return { meal }
  })

  app.get(
    '/resume',
    { preHandler: [CheckIfSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const meals = await knex('meals').where({
        session_id: sessionId,
      })

      const mealsOnDiet = await knex('meals').where({
        session_id: sessionId,
        isDiet: true,
      })

      const mealsOutDiet = await knex('meals').where({
        session_id: sessionId,
        isDiet: false,
      })

      let bestSequence = 0
      let count = 0

      for (let i = 0; i < meals.length; i++) {
        if (Number(meals[i].isDiet) === 1) {
          count++
        }

        if (Number(meals[i].isDiet) === 0) {
          if (count > bestSequence) {
            bestSequence = count
          }
          count = 0
        }

        if (count > bestSequence) {
          bestSequence = count
        }
      }

      return reply.status(200).send({
        meals: meals.length,
        mealsOnDiet: mealsOnDiet.length,
        mealsOutDiet: mealsOutDiet.length,
        bestSequence,
      })
    },
  )

  app.post('/', async (request, reply) => {
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
      datetime: z.string(),
    })

    const { name, description, datetime, isDiet } = createMealSchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    console.log(datetime)

    await knex('meals').insert({
      meal_id: randomUUID(),
      name,
      description,
      datetime,
      isDiet,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.put(
    '/:id',
    { preHandler: [CheckIfSessionIdExists] },
    async (request, reply) => {
      const putMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const putMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        datetime: z.string(),
        isDiet: z.boolean(),
      })

      const { id } = putMealsParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const { name, description, datetime, isDiet } = putMealSchema.parse(
        request.body,
      )

      const meal = await knex('meals')
        .where({ meal_id: id, session_id: sessionId })
        .update({
          name,
          description,
          datetime,
          isDiet,
        })

      if (!meal) {
        return reply.status(404).send({
          error: 'meal not found!',
        })
      }

      return { meal }
    },
  )

  app.delete(
    '/:id',
    { preHandler: [CheckIfSessionIdExists] },
    async (request, reply) => {
      const GetMealIdFromParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = GetMealIdFromParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({
          meal_id: id,
        })
        .del()

      if (!meal) {
        return reply.status(404).send({
          error: 'meal not found!',
        })
      }

      return reply.status(200).send()
    },
  )
}
