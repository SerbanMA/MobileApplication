import React, { useContext, useEffect, useState } from 'react';
import { IonAlert, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonImg, IonInput, IonLoading, IonPage, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { getLogger } from '../core';
import { NoteContext } from './NoteProvider';
import { RouteComponentProps } from 'react-router';
import { NoteProps, Photography } from './NoteProps';
import { arrowBack, camera } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { resultingClientExists } from 'workbox-core/_private';

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
  const [photo, setPhoto] = useState<Photography>({ path: '', webPath: '' });
  const [photoToShow, setPhotoToShow] = useState('');
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
      if (note.photo) setPhoto(note.photo);
    }
  }, [match.params.id, notes]);

  useEffect(() => {
    defineCustomElements(window);
  }, []);

  useEffect(() => {
    showPicture(photo);
  }, [photo]);

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

    const fileName = new Date().getTime() + '.jpeg';
    const savedFileImage = await savePicture(capturedPhoto, fileName);
    setPhoto(savedFileImage);
  };

  const savePicture = async (photo: Photo, fileName: string): Promise<Photography> => {
    const base64Data = await base64FromPath(photo.webPath!);
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      path: fileName,
      webPath: photo.webPath,
    };
  };

  const showPicture = (photo?: Photography): void => {
    if (photo?.path) {
      Filesystem.readFile({
        path: photo.path || '',
        directory: Directory.Data,
      }).then((result) => {
        console.log(result);

        setPhotoToShow(`data:image/jpeg;base64,${result.data}`);
      });
    }
  };

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

        <img width={120} height={120} src={photoToShow} style={{ marginLeft: '20px', marginRight: '20px' }} />
        <IonTextarea rows={23} value={message} onIonChange={(e) => setMessage(e.detail.value || '')} style={{ marginLeft: '10px', marginRight: '10px' }} />
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

export async function base64FromPath(path: string): Promise<string> {
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
