import React, { useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { IonAlert, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonList, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { add, wifi } from 'ionicons/icons';
import Note from './Note';
import { getLogger } from '../core';
import { isServerDown, NoteContext } from './NoteProvider';
import { useNetwork } from '../services/useNetwork';
import '../theme/network.css';

const log = getLogger('NoteList');

const NoteList: React.FC<RouteComponentProps> = ({ history }) => {
  const { notes, fetching, fetchingError, savingError, deletingError } = useContext(NoteContext);
  const { networkStatus } = useNetwork();
  const status = networkStatus.connected == true ? 'success' : 'danger';
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>NoteIT Pro</IonTitle>
          <IonIcon class="network" icon={wifi} slot="end" size="large" color={status}></IonIcon>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching notes" />
        {notes && (
          <IonList>
            {notes.map(({ id, title, message, done, lastChange, characters }) => (
              <Note key={id} id={id} title={title} message={message} done={done} lastChange={lastChange} characters={characters} onEdit={(id) => history.push(`/note/${id}`)} />
            ))}
          </IonList>
        )}
        {fetchingError && <IonAlert isOpen={true} message={fetchingError?.message} buttons={['OK']} />}
        {savingError && <IonAlert isOpen={true} message={savingError?.message} buttons={['OK']} />}
        {deletingError && <IonAlert isOpen={true} message={deletingError?.message} buttons={['OK']} />}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/note')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default NoteList;
