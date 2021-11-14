import axios from 'axios';
import { getLogger } from '../core';
import { NoteProps } from './NoteProps';

const log = getLogger('NoteApi');

const baseUrl = 'localhost:8080';
const noteUrl = `http://${baseUrl}/note`;

interface ResponseProps<T> {
  data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
  log(`${fnName} - started`);
  return promise
    .then((res) => {
      log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch((err) => {
      log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}

const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getNotes: () => Promise<NoteProps[]> = () => {
  return withLogs(axios.get(`${noteUrl}s`, config), 'getNotes');
};

export const createNote: (note: NoteProps) => Promise<NoteProps[]> = (note) => {
  return withLogs(axios.post(noteUrl, note, config), 'createNote');
};

export const updateNote: (note: NoteProps) => Promise<NoteProps[]> = (note) => {
  return withLogs(axios.put(`${noteUrl}/${note.id}`, note, config), 'updateNote');
};

export const removeNote: (note: NoteProps) => Promise<NoteProps[]> = (note) => {
  return withLogs(axios.delete(`${noteUrl}/${note.id}`, config), 'deleteNote');
};

interface MessageData {
  event: string;
  payload: {
    note: NoteProps;
  };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log('web socket onopen');
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = (error) => {
    log('web socket onerror', error);
  };
  ws.onmessage = (messageEvent) => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  };
};
