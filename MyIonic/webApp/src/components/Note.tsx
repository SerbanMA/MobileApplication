import React from 'react';
import { IonBadge, IonButton, IonFabButton, IonIcon, IonLabel, IonItem } from '@ionic/react';
import { NoteProps } from './NoteProps';
import { cloudCircle } from 'ionicons/icons';
import '../theme/network.css';

interface NotePropsExt extends NoteProps {
  onEdit: (id?: string) => void;
}

const Note: React.FC<NotePropsExt> = ({ id, title, message, done, lastChange, characters, onEdit }) => {
  var color = done ? 'success' : 'danger';

  return (
    <IonItem onClick={() => onEdit(id)}>
      <IonIcon id="cloud" icon={cloudCircle} slot="start" size="small" color={color} />
      <IonLabel>
        <h2>{title}</h2>
        <p text-wrap={message}>{message}</p>
      </IonLabel>
      <IonBadge>{characters}</IonBadge>
    </IonItem>
  );
};

export default Note;
