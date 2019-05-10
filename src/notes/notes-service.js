'use strict';
const notesService = {
  getAllNotes(knex) {
    return knex.select('*').from('notes');
  },
  insertArticle(knex, newArticle) {
    return knex
      .insert(newArticle)
      .into('notes')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from('notes').select('*').where('id', id).first();
  },
  deleteArticle(knex, id) {
    return knex('notes')
      .where({ id })
      .delete();
  },
  updateArticle(knex, id, newArticleFields) {
    return knex('notes')
      .where({ id })
      .update(newArticleFields);
  },
};

module.exports = notesService;