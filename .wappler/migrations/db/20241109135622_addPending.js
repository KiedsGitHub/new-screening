
exports.up = function(knex) {
  return knex.schema
    .table('request_form', async function (table) {
      table.text('status').defaultTo('Pending').alter();
    })

};

exports.down = function(knex) {
  return knex.schema
    .table('request_form', async function (table) {
      table.text('status').defaultTo().alter();
    })
};
