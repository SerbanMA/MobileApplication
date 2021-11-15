import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { NoteProps } from './NoteProps';
import { createNote, removeNote, getNotes, newWebSocket, updateNote } from './NoteApi';
import { useNetwork } from '../services/useNetwork';
import { Plugins } from '@capacitor/core/dist/esm';

const log = getLogger('NoteProvider');

type SaveNoteFn = (note: NoteProps) => Promise<any>;
type DeleteNoteFn = (note: NoteProps) => Promise<any>;

export interface NotesState {
  notes?: NoteProps[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  deleting: boolean;
  deletingError?: Error | null;
  saveNote?: SaveNoteFn;
  deleteNote?: DeleteNoteFn;
}

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: NotesState = {
  notes: [],
  fetching: false,
  saving: false,
  deleting: false,
};

const { Storage } = Plugins;

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const DELETE_ITEM_STARTED = 'DELETE_ITEM_STARTED';
const DELETE_ITEM_SUCCEEDED = 'DELETE_ITEM_SUCCEEDED';
const DELETE_ITEM_FAILED = 'DELETE_ITEM_FAILED';

const reducer: (state: NotesState, action: ActionProps) => NotesState = (state, { type, payload }) => {
  switch (type) {
    case FETCH_ITEMS_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_ITEMS_SUCCEEDED:
      return { ...state, notes: payload.notes, fetching: false };
    case FETCH_ITEMS_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };
    case SAVE_ITEM_STARTED:
      return { ...state, savingError: null, saving: true };
    case SAVE_ITEM_SUCCEEDED:
      const notes = [...(state.notes || [])];
      const note = payload.note;
      const index = notes.findIndex((it) => it.id === note.id);
      if (index === -1) {
        notes.splice(0, 0, note);
      } else {
        notes[index] = note;
      }
      return { ...state, notes, saving: false };
    case SAVE_ITEM_FAILED:
      return { ...state, deletingError: payload.error, deleting: false };
    case DELETE_ITEM_STARTED:
      return { ...state, deleting: true, deletingError: null };
    case DELETE_ITEM_SUCCEEDED:
      const dNotes = state.notes?.filter((item) => item.id != payload.note.id);
      return { ...state, notes: dNotes, deleting: false };
    case DELETE_ITEM_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };
    default:
      return state;
  }
};

export const NoteContext = React.createContext<NotesState>(initialState);

interface NoteProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const NoteProvider: React.FC<NoteProviderProps> = ({ children }) => {
  var { networkStatus } = useNetwork();

  const [state, dispatch] = useReducer(reducer, initialState);
  const { notes, fetching, fetchingError, saving, savingError, deleting, deletingError } = state;
  useEffect(() => {
    handleNetwork();
    getNotesEffect();
    wsEffect();
  }, [networkStatus]);
  const saveNote = useCallback<SaveNoteFn>(saveNoteCallback, [networkStatus]);
  const deleteNote = useCallback<DeleteNoteFn>(deleteNoteCallback, [networkStatus]);
  const value = { notes, fetching, fetchingError, saving, savingError, deleting, deletingError, saveNote, deleteNote };

  var newId = networkStatus.id;

  log('returns');
  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;

  function getNotesEffect() {
    let canceled = false;
    fetchNotes();
    return () => {
      canceled = true;
    };

    async function fetchNotes() {
      if (!networkStatus.connected) {
        fetchNotesOffline();
        return;
      }
      try {
        log('fetchNotes started');
        dispatch({ type: FETCH_ITEMS_STARTED });
        const notes = await getNotes();
        log('fetchNotes succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { notes } });
        }
      } catch (error: any) {
        if (isServerDown(error)) {
          fetchNotesOffline();
          return;
        }

        log('fetchNotes failed');
        dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
      }
    }
  }

  async function fetchNotesOffline() {
    var notes: NoteProps[] = [];
    const { keys } = await Storage.keys();

    keys.forEach(async (key) => {
      const { value: body } = await Storage.get({ key });
      const note: NoteProps = JSON.parse(body || '');
      notes.push(note);
    });

    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { notes: notes } });
  }

  async function saveNoteCallback(note: NoteProps) {
    if (!networkStatus.connected) {
      saveNoteOfflineCallback(note);
      return;
    }

    try {
      log('saveNote started');
      dispatch({ type: SAVE_ITEM_STARTED });
      const savedNote = await (note.id ? updateNote(note) : createNote(note));
      log('saveNote succeeded');
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { note: savedNote } });
    } catch (error) {
      if (isServerDown(error)) {
        saveNoteOfflineCallback(note);
        return;
      }

      log('saveNote failed');
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  async function saveNoteOfflineCallback(note: NoteProps) {
    var newNote = note;
    if (note.id == undefined) {
      newId = Number(newId) - 1 + '';
      newNote = { ...note, id: newId };
    }
    dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { note: newNote } });
    await Storage.set({
      key: newNote.id || '0',
      value: JSON.stringify({ ...newNote, action: 'save' }),
    });
  }

  async function deleteNoteCallback(note: NoteProps) {
    if (!networkStatus.connected) {
      deleteNoteOfflineCallback(note);
      return;
    }

    try {
      log('deleteNote started');
      dispatch({ type: DELETE_ITEM_STARTED });
      await removeNote(note);
      log('deleteNote succeeded');
      dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { note } });
    } catch (error) {
      if (isServerDown(error)) {
        deleteNoteOfflineCallback(note);
        return;
      }

      log('deleteNote failed');
      dispatch({ type: DELETE_ITEM_FAILED, payload: { error } });
    }
  }

  async function deleteNoteOfflineCallback(note: NoteProps) {
    dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { note: note } });
    await Storage.set({
      key: note.id || '0',
      value: JSON.stringify({ ...note, action: 'delete' }),
    });
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket((message) => {
      if (canceled) {
        return;
      }
      const {
        event,
        payload: { note },
      } = message;
      log(`ws message, note ${event}`);
      if (event === 'created' || event === 'updated') {
        dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { note } });
      }
    });
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    };
  }

  function handleNetwork() {
    (async () => {
      if (networkStatus.connected) {
        const { keys } = await Storage.keys();

        keys.forEach(async (key) => {
          const { value: body } = await Storage.get({ key });
          const note: NoteProps = JSON.parse(body || '');
          const { action } = JSON.parse(body || '');

          switch (action) {
            case 'save':
              if (Number(note.id) < 0) note.id = undefined;
              saveNoteCallback(note);
              break;
            case 'delete':
              deleteNoteCallback(note);
              break;
          }

          await Storage.remove({ key });
        });
      } else {
        notes?.forEach(async (note) => {
          await Storage.set({
            key: note.id || '0',
            value: JSON.stringify({ ...note, action: 'save' }),
          });
        });
      }
    })();
  }
};

export function isServerDown(error: any) {
  return error.message == 'Network Error';
}
