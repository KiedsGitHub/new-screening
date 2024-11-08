
exports.up = function(knex) {
  return knex.schema
    .createTable('request_form', async function (table) {
      table.increments('request_id');
      table.text('requester_name');
      table.date('submit_date');
      table.text('requesition_type');
      table.text('justification');
      table.text('job_grade');
      table.text('job_description');
      table.text('job_title');
      table.text('report_to');
      table.date('require_date');
    })

};

exports.down = function(knex) {
  return knex.schema
    .dropTable('request_form')
};
