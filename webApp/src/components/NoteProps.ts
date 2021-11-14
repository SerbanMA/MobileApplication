export interface NoteProps {
  id?: string;
  title: string;
  message: string;
  done: boolean;
  lastChange?: Date;
  characters?: number;
}
