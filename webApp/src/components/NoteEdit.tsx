import React, { useContext, useEffect, useState } from 'react';
import { IonAlert, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon, IonInput, IonLoading, IonPage, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { getLogger } from '../core';
import { NoteContext } from './NoteProvider';
import { RouteComponentProps } from 'react-router';
import { NoteProps } from './NoteProps';
import { colorFill, remove } from 'ionicons/icons';
import { useNetwork } from '../services/useNetwork';

const log = getLogger('NoteEdit');

interface NoteEditProps
  extends RouteComponentProps<{
    id?: string;
  }> {}

const NoteEdit: React.FC<NoteEditProps> = ({ history, match }) => {
  const { notes, saving, savingError, saveNote } = useContext(NoteContext);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(true);
  const [note, setNote] = useState<NoteProps>();
  const { networkStatus } = useNetwork();
  const [showAllert, setShowAllert] = useState(false);

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
    if (networkStatus.connected == true) {
      const editedNote = note ? { ...note, title, message, done } : { title, message, done };
      saveNote && saveNote(editedNote).then(() => history.goBack());
    } else {
      log('nu am putut da save :)');
      setShowAllert(true);
    }
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
          <IonAlert isOpen={showAllert} onDidDismiss={() => setShowAllert(false)} header={'Header'} subHeader={'Subtitle'} message={'This is an alert message.'} buttons={['OK']} />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonTextarea rows={32} value={message} onIonChange={(e) => setMessage(e.detail.value || '')} />
        <IonLoading isOpen={saving} />
        {savingError && <div>{savingError.message || 'Failed to save note'}</div>}
      </IonContent>
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => {}}>
          <IonIcon icon={remove} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};

export default NoteEdit;
