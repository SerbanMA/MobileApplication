import React, { useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { IonAlert, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonList, IonLoading, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonTitle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { search, wifi } from 'ionicons/icons';
import Note from './Note';
import { getLogger } from '../core';
import { NoteContext } from './NoteProvider';
import { useNetwork } from '../services/useNetwork';
import '../theme/network.css';

const log = getLogger('NoteList');

const NoteList: React.FC<RouteComponentProps> = ({ history }) => {
  const { notes, types, fetchingError, savingError, deletingError, loadMore, isInfiniteDisabled, fetchTypes, type, setType, searchKeyword, setSearchKeyword } = useContext(NoteContext);
  const { networkStatus } = useNetwork();
  const status = networkStatus.connected == true ? 'success' : 'danger';
  log('render');

  useIonViewWillEnter(async () => {
    await fetchTypes();
    await loadMore(new CustomEvent<void>('hi'), true);
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonIcon class="network" icon={wifi} size="large" color={status} slot="start"></IonIcon>
          <IonTitle>NoteIT Pro</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/note')}>Add</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonSearchbar value={searchKeyword} debounce={1000} onIonChange={(e) => setSearchKeyword(e.detail.value!)}></IonSearchbar>
        <IonSelect value={type} placeholder="Select Type" onIonChange={(e) => setType(e.detail.value)}>
          {types.map((type) => (
            <IonSelectOption key={type} value={type}>
              {type}
            </IonSelectOption>
          ))}
        </IonSelect>

        {notes && (
          <IonList>
            {notes
              .sort((a, b) => compare(a.id, b.id))
              .map(({ id, type, title, message, done, lastChange, characters }) => (
                <Note key={id} id={id} type={type} title={title} message={message} done={done} lastChange={lastChange} characters={characters} onEdit={(id) => history.push(`/note/${id}`)} />
              ))}
          </IonList>
        )}

        <IonInfiniteScroll threshold="100px" disabled={isInfiniteDisabled} onIonInfinite={(e: CustomEvent<void>) => loadMore(e)}>
          <IonInfiniteScrollContent loadingText="Loading more notes..."></IonInfiniteScrollContent>
        </IonInfiniteScroll>

        {fetchingError && <IonAlert isOpen={true} message={fetchingError?.message} buttons={['OK']} />}
        {savingError && <IonAlert isOpen={true} message={savingError?.message} buttons={['OK']} />}
        {deletingError && <IonAlert isOpen={true} message={deletingError?.message} buttons={['OK']} />}
      </IonContent>
    </IonPage>
  );
};

function compare(value1?: String, value2?: String) {
  var number1 = Number(value1);
  var number2 = Number(value2);

  if (number1 < 0) number1 = 1000 + Math.abs(number1);
  if (number2 < 0) number2 = 1000 + Math.abs(number2);

  return number2 - number1;
}

export default NoteList;
