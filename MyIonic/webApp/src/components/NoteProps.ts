export interface NoteProps {
  id?: string;
  type: string;
  title: string;
  message: string;
  done?: boolean;
  lastChange?: Date;
  characters?: number;
  photo?: Photography;
}

export interface Photography {
  path: string;
  webPath?: string;
}
