'use strict';
const path = require('path');
const express = require('express');
const xss = require('xss');
const FoldersService = require('./Folders-service');

const FoldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolders = folders => ({
  id: folders.id,
  name: folders.name
});

FoldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    FoldersService.getAllFolders(knexInstance)
      .then(Folders => {
        res.json(Folders.map(serializeFolders));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, content, style, author } = req.body;
    const newfolders = { title, content, style };

    for (const [key, value] of Object.entries(newfolders))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
    newfolders.author = author;
    FoldersService.insertfolders(
      req.app.get('db'),
      newfolders
    )
      .then(folders => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folders.id}`))
          .json(serializeFolders(folders));
      })
      .catch(next);
  });

FoldersRouter
  .route('/:folders_id')
  .all((req, res, next) => {
    FoldersService.getById(
      req.app.get('db'),
      req.params.folders_id
    )
      .then(folders => {
        if (!folders) {
          return res.status(404).json({
            error: { message: 'folders doesn\'t exist' }
          });
        }
        res.folders = folders;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeFolders(res.folders));
  })
  .delete((req, res, next) => {
    FoldersService.deletefolders(
      req.app.get('db'),
      req.params.folders_id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, content, style } = req.body;
    const foldersToUpdate = { title, content, style };

    const numberOfValues = Object.values(foldersToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must content either \'title\', \'style\' or \'content\''
        }
      });

    FoldersService.updatefolders(
      req.app.get('db'),
      req.params.folders_id,
      foldersToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = FoldersRouter;