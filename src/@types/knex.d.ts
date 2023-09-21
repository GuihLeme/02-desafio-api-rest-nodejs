// eslint-disable-next-line
import { StringAsNumber } from 'fastify/types/utils'
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      user_id: string
      name: string
      email: string
    }
    meals: {
      meal_id: string
      name: string
      description: string
      datetime: Date
      isDiet: boolean
      user_id: string
    }
  }
}
