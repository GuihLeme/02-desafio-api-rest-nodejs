import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('meal_id').primary()
    table.string('name').notNullable()
    table.text('description').notNullable()
    table.datetime('datetime').notNullable()
    table.boolean('isDiet').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
