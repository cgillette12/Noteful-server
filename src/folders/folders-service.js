'use strict';
const FoldersService = {
  getAllFolders(knex) {
    return knex.select('*').from('Folders');
  },
  insertArticle(knex, newArticle) {
    return knex
      .insert(newArticle)
      .into('Folders')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from('Folders').select('*').where('id', id).first();
  },
  deleteArticle(knex, id) {
    return knex('Folders')
      .where({ id })
      .delete();
  },
  updateArticle(knex, id, newArticleFields) {
    return knex('Folders')
      .where({ id })
      .update(newArticleFields);
  },
};

module.exports = FoldersService;