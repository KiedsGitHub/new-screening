
exports.up = function(knex) {
  return knex.schema
    .table('user', async function (table) {
      table.text('role').defaultTo('Default').alter();
    })

};

exports.down = function(knex) {
  return knex.schema
    .table('user', async function (table) {
      table.text('role').defaultTo().alter();
    })
};
