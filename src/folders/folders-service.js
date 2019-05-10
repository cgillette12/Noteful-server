'use strict';
const FoldersService = {
  getAllFolders(knex) {
    return knex.select('*').from('folder');
  },
  insertArticle(knex, newArticle) {
    return knex
      .insert(newArticle)
      .into('folder')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from('folder').select('*').where('id', id).first();
  },
  deleteArticle(knex, id) {
    return knex('folder')
      .where({ id })
      .delete();
  },
  updateArticle(knex, id, newArticleFields) {
    return knex('folder')
      .where({ id })
      .update(newArticleFields);
  },
};

module.exports = FoldersService;