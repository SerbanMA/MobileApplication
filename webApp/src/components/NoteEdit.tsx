import React, { useContext, useEffect, useState } from 'react';
import { IonAlert, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonLoading, IonPage, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { getLogger } from '../core';
import { NoteContext } from './NoteProvider';
import { RouteComponentProps } from 'react-router';
import { NoteProps } from './NoteProps';
import { remove } from 'ionicons/icons';
import { useNetwork } from '../services/useNetwork';

const log = getLogger('NoteEdit');

interface NoteEditProps
  extends RouteComponentProps<{
    id?: string;
  }> {}

const NoteEdit: React.FC<NoteEditProps> = ({ history, match }) => {
  const { notes, saving, savingError, deleting, deletingError, saveNote, deleteNote } = useContext(NoteContext);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(true);
  const [note, setNote] = useState<NoteProps>();
  const { networkStatus } = useNetwork();

  const [showAllert, setShowAllert] = useState(networkStatus.connected);

  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const note = notes?.find((it) => it.id === routeId);
    setNote(note);
    if (note) {
      setTitle(note.title);
      setMessage(note.message);
      setDone(note.done);
    }
  }, [match.params.id, notes]);

  const handleSave = () => {
    const editedNote = note ? { ...note, title, message, done } : { title, message, done };
    saveNote && saveNote(editedNote).then(() => history.goBack());
  };

  const handleDelete = () => {
    const deletedNote = note ? { ...note, title, message, done } : { title, message, done };
    deleteNote && deleteNote(deletedNote).then(() => history.goBack());
  };

  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonInput value={title} onIonChange={(e) => setTitle(e.detail.value || '')} />
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>Save</IonButton>
          </IonButtons>
          <IonAlert isOpen={showAllert} onDidDismiss={() => setShowAllert(false)} header={'Disconnected'} message={'Your changes will be applied after you connect to the internet.'} buttons={[{ text: 'OK', handler: () => history.goBack() }]} />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonTextarea rows={32} value={message} onIonChange={(e) => setMessage(e.detail.value || '')} />
        <IonLoading isOpen={saving} />
        <IonLoading isOpen={deleting} />
      </IonContent>
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleDelete}>
          <IonIcon icon={remove} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};

export default NoteEdit;
