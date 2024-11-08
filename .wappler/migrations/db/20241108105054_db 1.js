
exports.up = function(knex) {
  return knex.schema
    .createTable('user', async function (table) {
      table.increments('user_id');
      table.string('name');
      table.string('email');
      table.string('password');
      table.string('role');
    })

};

exports.down = function(knex) {
  return knex.schema
    .dropTable('user')
};
