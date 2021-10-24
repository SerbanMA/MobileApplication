package ro.ubb.sharednotes.converter;

import org.springframework.stereotype.Component;
import ro.ubb.sharednotes.domain.Note;
import ro.ubb.sharednotes.dto.NoteDto;

@Component
public class NoteConverter implements BaseConverter<NoteDto, Note> {
    @Override
    public NoteDto convertModelToDto(Note model) {
        return NoteDto.builder()
                .id(model.getId())
                .message(model.getMessage())
                .build();
    }

    @Override
    public Note convertDtoToModel(NoteDto dto) {
        Note note = Note.builder()
                .message(dto.getMessage())
                .build();
        note.setId(dto.getId());
        return note;
    }
}
