
exports.up = function(knex) {
  return knex.schema
    .createTable('user', async function (table) {
      table.increments('user_id');
      table.text('name');
      table.text('email');
      table.text('password');
      table.text('role');
    })

};

exports.down = function(knex) {
  return knex.schema
    .dropTable('user')
};
