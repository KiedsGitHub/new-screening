
exports.up = function(knex) {
  return knex.schema
    .table('user', async function (table) {
      table.text('name').alter();
      table.text('email').alter();
      table.text('password').alter();
      table.text('role').alter();
    })

};

exports.down = function(knex) {
  return knex.schema
    .table('user', async function (table) {
      table.string('name', 255).alter();
      table.string('email', 255).alter();
      table.string('password', 255).alter();
      table.string('role', 255).alter();
    })
};
