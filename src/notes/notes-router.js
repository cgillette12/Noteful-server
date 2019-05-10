'use strict';
const path = require('path');
const express = require('express');
const xss = require('xss');
const NotesService = require('./Notes-service');

const NotesRouter = express.Router();
const jsonParser = express.json();

const serializeNotes = notes => ({
  id :notes.id,
  title: notes.title,
  folder_id :notes.folder_id,
  content :notes.content
  
});

NotesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    NotesService.getAllNotes(knexInstance)
      .then(Notes => {
        res.json(Notes.map(serializeNotes));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, content } = req.body;
    const newnotes = { title, content };

    for (const [key, value] of Object.entries(newnotes))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
    NotesService.insertNotes(
      req.app.get('db'),
      newnotes
    )
      .then(notes => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${notes.id}`))
          .json(serializeNotes(notes));
      })
      .catch(next);
  });

NotesRouter
  .route('/:notes_id')
  .all((req, res, next) => {
    NotesService.getById(
      req.app.get('db'),
      req.params.notes_id
    )
      .then(notes => {
        if (!notes) {
          return res.status(404).json({
            error: { message: 'notes doesn\'t exist' }
          });
        }
        res.notes = notes;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNotes(res.notes));
  })
  .delete((req, res, next) => {
    NotesService.deleteNotes(
      req.app.get('db'),
      req.params.notes_id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, content } = req.body;
    const notesToUpdate = { title, content };

    const numberOfValues = Object.values(notesToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must content either \'title\', \' or \'content\''
        }
      });

    NotesService.updateNotes(
      req.app.get('db'),
      req.params.notes_id,
      notesToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = NotesRouter;