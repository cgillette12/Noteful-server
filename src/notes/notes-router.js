'use strict';
const path = require('path');
const express = require('express');
const xss = require('xss');
const NotesService = require('./Notes-service');

const NotesRouter = express.Router();
const jsonParser = express.json();

const serializeNotes = notes => ({
  id: notes.id,
  style: notes.style,
  title: xss(notes.title),
  content: xss(notes.content),
  date_published: notes.date_published,
  author: notes.author
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
    const { title, content, style, author } = req.body;
    const newnotes = { title, content, style };

    for (const [key, value] of Object.entries(newnotes))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
    newnotes.author = author;
    NotesService.insertnotes(
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
    NotesService.deletenotes(
      req.app.get('db'),
      req.params.notes_id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, content, style } = req.body;
    const notesToUpdate = { title, content, style };

    const numberOfValues = Object.values(notesToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must content either \'title\', \'style\' or \'content\''
        }
      });

    NotesService.updatenotes(
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