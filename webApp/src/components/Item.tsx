import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { ItemProps } from './ItemProps';

interface ItemPropsExt extends ItemProps {
  onEdit: (id?: string) => void;
}

const Item: React.FC<ItemPropsExt> = ({ id, title, message, done, lastChange, characters, onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(id)}>
      <IonLabel>
        <h2>{title}</h2>
        <p text-wrap>{message}</p>
      </IonLabel>
    </IonItem>
  );
};

export default Item;
