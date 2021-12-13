import React, { useCallback, useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { NoteProps } from './NoteProps';
import { createNote, removeNote, getNotes, newWebSocket, updateNote, getTypes } from './NoteApi';
import { useNetwork } from '../services/useNetwork';
import { Storage } from '@capacitor/storage';

const log = getLogger('NoteProvider');

type SaveNoteFn = (note: NoteProps) => Promise<any>;
type DeleteNoteFn = (note: NoteProps) => Promise<any>;
type SearchNextFn = ($event: CustomEvent<void>, abc?: boolean) => void;
type FetchTypeFn = () => void;
type SetTypeFn = (type: string) => void;

export interface NotesState {
  notes: NoteProps[];
  types: string[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  deleting: boolean;
  deletingError?: Error | null;
  saveNote?: SaveNoteFn;
  deleteNote?: DeleteNoteFn;
  loadMore: SearchNextFn;
  isInfiniteDisabled?: boolean;
  fetchTypes: FetchTypeFn;
  type?: string;
  setType: SetTypeFn;
  searchKeyword?: string;
  setSearchKeyword: SetTypeFn;
}

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: NotesState = {
  notes: [],
  types: [],
  fetching: false,
  saving: false,
  deleting: false,
  loadMore: ($event: CustomEvent<void>) => {},
  fetchTypes: () => {},
  setType: (type: string) => {},
  setSearchKeyword: (type: string) => {},
};

const FILTER_ITEMS = 'FILTER_ITEMS';
const REINITIALIZE_ITEMS_STARTED = 'REINITIALIZE_ITEMS_STARTED';
const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const FETCH_TYPES_STARTED = 'FETCH_TYPES_STARTED';
const FETCH_TYPES_SUCCEEDED = 'FETCH_TYPES_SUCCEEDED';
const FETCH_TYPES_FAILED = 'FETCH_TYPES_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const DELETE_ITEM_STARTED = 'DELETE_ITEM_STARTED';
const DELETE_ITEM_SUCCEEDED = 'DELETE_ITEM_SUCCEEDED';
const DELETE_ITEM_FAILED = 'DELETE_ITEM_FAILED';

const reducer: (state: NotesState, action: ActionProps) => NotesState = (state, { type, payload }) => {
  switch (type) {
    case FILTER_ITEMS:
      var fNotes = state.notes.filter((item) => Number(item.id) >= 0);
      return { ...state, notes: fNotes };

    case REINITIALIZE_ITEMS_STARTED:
      return { ...state, notes: [] };

    case FETCH_ITEMS_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_ITEMS_SUCCEEDED:
      const allNotes = [...(state.notes || []), ...payload.notes];
      return { ...state, notes: allNotes, fetching: false };
    case FETCH_ITEMS_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };

    case FETCH_TYPES_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_TYPES_SUCCEEDED:
      return { ...state, types: payload.types, fetching: false };
    case FETCH_TYPES_FAILED:
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
      return { ...state, savingError: payload.error, deleting: false };

    case DELETE_ITEM_STARTED:
      return { ...state, deleting: true, deletingError: null };
    case DELETE_ITEM_SUCCEEDED:
      const dNotes = state.notes?.filter((item) => item.id != payload.note.id);
      return { ...state, notes: dNotes, deleting: false };
    case DELETE_ITEM_FAILED:
      return { ...state, deletingError: payload.error, fetching: false };
    default:
      return state;
  }
};

export const NoteContext = React.createContext<NotesState>(initialState);

interface NoteProviderProps {
  children: PropTypes.ReactNodeLike;
}

var searchKeyword = '';
var type = '';
var page = 0;
const pageSize = 10;

export const NoteProvider: React.FC<NoteProviderProps> = ({ children }) => {
  var { networkStatus } = useNetwork();

  const [isInfiniteDisabled, setInfiniteDisabled] = useState<boolean>(false);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { notes, types, fetching, fetchingError, saving, savingError, deleting, deletingError } = state;
  useEffect(() => {
    handleNetwork();
    wsEffect();
  }, [networkStatus]);
  const saveNote = useCallback<SaveNoteFn>(saveNoteCallback, [networkStatus]);
  const deleteNote = useCallback<DeleteNoteFn>(deleteNoteCallback, [networkStatus]);
  const loadMore = useCallback<SearchNextFn>(loadMoreCallback, []);
  const fetchTypes = useCallback<FetchTypeFn>(fetchTypesCallback, []);
  const setType = useCallback<SetTypeFn>(setTypeCallback, []);
  const setSearchKeyword = useCallback<SetTypeFn>(setSearchKeywordCallback, []);
  const value = { notes, types, fetching, fetchingError, saving, savingError, deleting, deletingError, saveNote, deleteNote, loadMore, isInfiniteDisabled, fetchTypes, type, setType, searchKeyword, setSearchKeyword };

  var newId = networkStatus.id;

  log('returns');
  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;

  async function fetchTypesCallback() {
    let canceled = false;
    fetchTypes();
    return () => {
      canceled = true;
    };

    async function fetchTypes() {
      if (!networkStatus.connected) {
        return;
      }
      try {
        log('fetchTypes started');
        dispatch({ type: FETCH_TYPES_STARTED });

        const types = await getTypes();
        log('types', types);

        if (!canceled) {
          log('fetchTypes succedded');
          dispatch({ type: FETCH_TYPES_SUCCEEDED, payload: { types } });
        }
      } catch (error: any) {
        if (isServerDown(error)) {
          return;
        }

        log('fetchTypes failed');
        dispatch({ type: FETCH_TYPES_FAILED, payload: { error } });
      }
    }
  }

  async function loadMoreCallback($event: CustomEvent<void>, abc?: boolean) {
    if (!abc || page === 0) {
      page = page + 1;
      await getNotesEffect();
    }
    try {
      ($event.target as HTMLIonInfiniteScrollElement).complete();
    } catch (error) {}
  }

  async function setTypeCallback(newType: string) {
    type = newType;
    page = 1;
    dispatch({ type: REINITIALIZE_ITEMS_STARTED });
    getNotesEffect();
  }

  async function setSearchKeywordCallback(newSearchKeyword: string) {
    searchKeyword = newSearchKeyword;
    page = 1;
    dispatch({ type: REINITIALIZE_ITEMS_STARTED });
    getNotesEffect();
  }

  async function getNotesEffect() {
    let canceled = false;
    fetchNotes();
    return () => {
      canceled = true;
    };

    async function fetchNotes() {
      if (!networkStatus.connected) {
        log('fetchNotes started - offline mode');
        fetchNotesOffline();
        return;
      }
      try {
        log('fetchNotes started');
        dispatch({ type: FETCH_ITEMS_STARTED });

        const notes = await getNotes(searchKeyword, type, page);

        setInfiniteDisabled(notes.length < pageSize);
        if (!canceled) {
          log('fetchNotes succedded');
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

    async function fetchNotesOffline() {
      var notes: NoteProps[] = [];
      const { keys } = await Storage.keys();

      keys.forEach(async (key: any) => {
        const { value: body } = await Storage.get({ key });
        const note: NoteProps = JSON.parse(body || '');
        notes.push(note);
      });
      dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { notes } });
      log('fetchNotes succedded - offline mode');
    }
  }

  async function saveNoteCallback(note: NoteProps) {
    if (!networkStatus.connected) {
      log('saveNotes started - offline mode');
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

        keys.forEach(async (key: any) => {
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

        dispatch({ type: FILTER_ITEMS });
      }
    })();
  }
};

export function isServerDown(error: any) {
  return error.message == 'Network Error';
}
