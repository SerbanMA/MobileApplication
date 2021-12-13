import React, { useContext, useEffect, useState } from 'react';
import { IonAlert, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonImg, IonInput, IonLoading, IonPage, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { getLogger } from '../core';
import { NoteContext } from './NoteProvider';
import { RouteComponentProps } from 'react-router';
import { NoteProps } from './NoteProps';
import { remove, arrowBack, camera, colorFill } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { Filesystem, Directory } from '@capacitor/filesystem';

const log = getLogger('NoteEdit');

interface NoteEditProps
  extends RouteComponentProps<{
    id?: string;
  }> {}

const NoteEdit: React.FC<NoteEditProps> = ({ history, match }) => {
  const { notes, saving, deleting, saveNote, deleteNote } = useContext(NoteContext);
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState({ filepath: '', webPath: '' });
  const [note, setNote] = useState<NoteProps>();

  var types = ['', 'shop list', 'score table', 'general note'];

  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const note = notes?.find((it) => it.id === routeId);
    setNote(note);
    if (note) {
      setType(note.type);
      setTitle(note.title);
      setMessage(note.message);
    }
  }, [match.params.id, notes]);

  useEffect(() => {
    defineCustomElements(window);
  }, []);

  const handleSave = () => {
    const editedNote = note ? { ...note, type, title, message, done: false, photo } : { type, title, message, done: false, photo };
    saveNote && saveNote(editedNote).then(() => history.goBack());
  };

  const handleDelete = () => {
    const deletedNote = note ? { ...note, type, title, message, done: false } : { type, title, message, done: false };
    deleteNote && deleteNote(deletedNote).then(() => history.goBack());
  };

  const takePhoto = async () => {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const fileName = new Date().getTime + '.jpeg';
    const savedFileImage = await savePicture(capturedPhoto, fileName);
  };

  const savePicture = async (photo: Photo, fileName: string): Promise<Photo> => {
    const base64Data = await base64FromPath(photo.webPath!);
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: fileName,
      webPath: photo.webPath,
    };
  };

  async function base64FromPath(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject('method did not return a string');
        }
      };
      reader.readAsDataURL(blob);
    });
  }

  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons class="network" onClick={history.goBack} slot="start">
            <IonIcon icon={arrowBack} />
          </IonButtons>
          <IonTitle>
            <IonInput value={title} onIonChange={(e) => setTitle(e.detail.value || '')} />
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleDelete}>Delete</IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>Save</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonSelect value={type} placeholder="Select Type" onIonChange={(e) => setType(e.detail.value)}>
          {types.map((type) => (
            <IonSelectOption key={type} value={type}>
              {type}
            </IonSelectOption>
          ))}
        </IonSelect>

        <IonImg src={note?.photo?.webPath} />
        <IonTextarea rows={29} value={message} onIonChange={(e) => setMessage(e.detail.value || '')} />
        <IonLoading isOpen={saving} />
        <IonLoading isOpen={deleting} />
      </IonContent>
      <IonFab vertical="bottom" horizontal="center" slot="fixed">
        <IonFabButton onClick={() => takePhoto()}>
          <IonIcon icon={camera}></IonIcon>
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};

export default NoteEdit;
function base64FromPath(arg0: string) {
  throw new Error('Function not implemented.');
}

