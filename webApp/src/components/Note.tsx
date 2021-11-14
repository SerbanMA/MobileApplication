import React from 'react';
import { IonBadge, IonButton, IonFabButton, IonIcon, IonLabel, IonItem } from '@ionic/react';
import { NoteProps } from './NoteProps';

interface NotePropsExt extends NoteProps {
  onEdit: (id?: string) => void;
}

const Note: React.FC<NotePropsExt> = ({ id, title, message, done, lastChange, characters, onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(id)}>
      <IonLabel>
        <h2>{title}</h2>
        <p text-wrap={message}>{message}</p>
      </IonLabel>
      <IonBadge>{characters}</IonBadge>
    </IonItem>
  );
};

export default Note;
