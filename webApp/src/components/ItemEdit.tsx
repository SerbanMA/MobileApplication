import React, { useContext, useEffect, useState } from 'react';
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';
import { ItemProps } from './ItemProps';

const log = getLogger('ItemEdit');

interface ItemEditProps
  extends RouteComponentProps<{
    id?: string;
  }> {}

const ItemEdit: React.FC<ItemEditProps> = ({ history, match }) => {
  const { items, saving, savingError, saveItem } = useContext(ItemContext);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [item, setItem] = useState<ItemProps>();
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const item = items?.find((it) => it.id === routeId);
    setItem(item);
    if (item) {
      setTitle(item.title);
      setMessage(item.message);
    }
  }, [match.params.id, items]);

  const handleSave = () => {
    const editedItem = item ? { ...item, title, message } : { title, message };
    saveItem && saveItem(editedItem).then(() => history.goBack());
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
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput value={message} onIonChange={(e) => setMessage(e.detail.value || '')} />
        <IonLoading isOpen={saving} />
        {savingError && <div>{savingError.message || 'Failed to save item'}</div>}
      </IonContent>
    </IonPage>
  );
};

export default ItemEdit;
