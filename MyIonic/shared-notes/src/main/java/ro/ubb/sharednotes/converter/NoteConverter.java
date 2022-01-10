package ro.ubb.sharednotes.converter;

import org.springframework.stereotype.Component;
import ro.ubb.sharednotes.domain.Note;
import ro.ubb.sharednotes.dto.NoteDto;

import java.util.Date;

@Component
public class NoteConverter implements BaseConverter<NoteDto, Note> {
    @Override
    public NoteDto convertModelToDto(Note model) {
        return NoteDto.builder()
                .id(model.getId().toString())
                .title(model.getTitle())
                .message(model.getMessage())
                .done(model.getDone())
                .characters(model.getCharacters())
                .lastChange(model.getLastChange())
                .build();
    }

    @Override
    public Note convertDtoToModel(NoteDto dto) {
        Note note = Note.builder()
                .title(dto.getTitle())
                .message(dto.getMessage())
                .done(dto.getDone())
                .characters(dto.getCharacters())
                .lastChange(dto.getLastChange())
                .build();
        note.setId(Integer.getInteger(dto.getId()));
        return note;
    }
}
