import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { NoteProps } from './NoteProps';
import { createNote, getNotes, newWebSocket, updateNote } from './NoteApi';

const log = getLogger('NoteProvider');

type SaveNoteFn = (note: NoteProps) => Promise<any>;

export interface NotesState {
  notes?: NoteProps[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  saveNote?: SaveNoteFn;
}

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: NotesState = {
  fetching: false,
  saving: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

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
      return { ...state, savingError: payload.error, saving: false };
    default:
      return state;
  }
};

export const NoteContext = React.createContext<NotesState>(initialState);

interface NoteProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const NoteProvider: React.FC<NoteProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { notes, fetching, fetchingError, saving, savingError } = state;
  useEffect(getNotesEffect, []);
  useEffect(wsEffect, []);
  const saveNote = useCallback<SaveNoteFn>(saveNoteCallback, []);
  const value = { notes, fetching, fetchingError, saving, savingError, saveNote };
  log('returns');
  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;

  function getNotesEffect() {
    let canceled = false;
    fetchNotes();
    return () => {
      canceled = true;
    };

    async function fetchNotes() {
      try {
        log('fetchNotes started');
        dispatch({ type: FETCH_ITEMS_STARTED });
        const notes = await getNotes();
        log('fetchNotes succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { notes } });
        }
      } catch (error) {
        log('fetchNotes failed');
        dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
      }
    }
  }

  async function saveNoteCallback(note: NoteProps) {
    try {
      log('saveNote started');
      dispatch({ type: SAVE_ITEM_STARTED });
      const savedNote = await (note.id ? updateNote(note) : createNote(note));
      log('saveNote succeeded');
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { note: savedNote } });
    } catch (error) {
      log('saveNote failed');
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
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
};
