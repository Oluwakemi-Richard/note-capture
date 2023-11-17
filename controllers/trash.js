const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;



const getTrashById = async (req, res) => {
  const noteId = new ObjectId(req.params.noteId);
  const db = await mongodb.getDb();
  const trashedNote = await db.db("note_capture").collection("trash").findOne({ _id: noteId });

  if (trashedNote) {
    res.status(200).json(trashedNote);
  } else {
    res.status(404).json({ error: `Trashed note with ID ${noteId} not found` });
  }
  };
  const getAllTrash = async (req, res) => {
    const db = await mongodb.getDb();
    const result = await db.db("note_capture").collection("trash").find();
    
    result.toArray().then((trashedNotes) => {
      res.status(200).json(trashedNotes);
    });
  };
  
const addToTrash = async (req, res) => {
  const noteId = new ObjectId(req.params.noteId);
  const db = await mongodb.getDb();
  const originalNote = await db.db("note_capture").collection("notes").findOne({ _id: noteId });

  if (!originalNote) {
    res.status(404).json({ error: `Note with ID ${noteId} not found` });
    return;
  }
  const trashNote = { ...originalNote, isTrashed: true };
  const responseMoveToTrash = await db.db("note_capture").collection("trash").insertOne(trashNote);
  const responseRemoveFromOriginal = await db.db("note_capture").collection("notes").deleteOne({ _id: noteId });
  if (responseMoveToTrash.acknowledged && responseRemoveFromOriginal.deletedCount > 0) {
    res.status(200).json({ message: `Note ${noteId} moved to trash` });
  } else {
    res.status(500).json(responseMoveToTrash.error || responseRemoveFromOriginal.error || 'Sorry, an error occurred while moving the note to trash.');
  }
};

  const deleteAllTrash= async (req, res) => {
    const db = await mongodb.getDb();
    const responseDeleteAllTrash = await db.db("note_capture").collection("trash").deleteMany({});
  
    if (responseDeleteAllTrash.deletedCount > 0) {
      res.status(200).json({ message: 'All notes in trash permanently deleted' });
    } else {
      res.status(500).json(responseDeleteAllTrash.error || 'Sorry, an error occurred while permanently deleting all notes from trash.');
    }
  };
  const restoreTrash = async (req, res) => {
    const noteId = new ObjectId(req.params.noteId);
    const db = await mongodb.getDb();
    const trashedNote = await db.db("note_capture").collection("trash").findOne({ _id: noteId });
  
    if (!trashedNote) {
      res.status(404).json({ error: `Trashed note with ID ${noteId} not found` });
      return;
    }
    const originalNote = { ...trashedNote, isTrashed: false };
    const responseMoveToOriginal = await db.db("note_capture").collection("notes").insertOne(originalNote);
    const responseRemoveFromTrash = await db.db("note_capture").collection("trash").deleteOne({ _id: noteId });
  
    if (responseMoveToOriginal.acknowledged && responseRemoveFromTrash.deletedCount > 0) {
      res.status(200).json({ message: `Note ${noteId} restored from trash` });
    } else {
      res.status(500).json(responseMoveToOriginal.error || responseRemoveFromTrash.error || 'Sorry, an error occurred while restoring the note from trash.');
    }
  };
  
  const deleteSingleTrash = async (req, res) => {
    const noteId = new ObjectId(req.params.noteId);
    const db = await mongodb.getDb();
    const responseRemoveFromTrash = await db.db("note_capture").collection("trash").deleteOne({ _id: noteId });
  
    if (responseRemoveFromTrash.deletedCount > 0) {
      res.status(200).json({ message: `Note ${noteId} permanently deleted from trash` });
    } else {
      res.status(500).json(responseRemoveFromTrash.error || 'Sorry, an error occurred while permanently deleting the note from trash.');
    }
  };
  

  module.exports = { getTrashById, getAllTrash,addToTrash,deleteAllTrash,restoreTrash,deleteSingleTrash};
