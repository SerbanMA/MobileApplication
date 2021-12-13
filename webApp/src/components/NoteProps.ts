export interface NoteProps {
  id?: string;
  type: string;
  title: string;
  message: string;
  done?: boolean;
  lastChange?: Date;
  characters?: number;
  photo?: Photo;
}

export interface Photo {
  filepath: string;
  webPath?: string;
}
