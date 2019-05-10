'use strict';
const FoldersService = {
  getAllFolders(knex) {
    return knex.select('*').from('folder');
  },
  insertFolders(knex, newFolders) {
    return knex
      .insert(newFolders)
      .into('folder')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from('folder').select('*').where('id', id).first();
  },
  deleteFolders(knex, id) {
    return knex('folder')
      .where({ id })
      .delete();
  },
  updateFolders(knex, id, newFoldersFields) {
    return knex('folder')
      .where({ id })
      .update(newFoldersFields);
  },
};

module.exports = FoldersService;