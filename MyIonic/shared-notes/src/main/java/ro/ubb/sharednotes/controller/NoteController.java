package ro.ubb.sharednotes.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ro.ubb.sharednotes.converter.NoteConverter;
import ro.ubb.sharednotes.domain.Note;
import ro.ubb.sharednotes.dto.NoteDto;
import ro.ubb.sharednotes.service.NoteService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notes")
@CrossOrigin(origins = {"http://localhost:3000"})
public class NoteController {
    private final NoteService noteService;
    private final NoteConverter noteConverter;

    @GetMapping
    public List<NoteDto> getAll() {
        return noteConverter.convertModelsToDtos(
                noteService.getAll()
        );
    }

    @PostMapping
    public NoteDto save(@RequestBody NoteDto noteDto) {
        return noteConverter.convertModelToDto(
                noteService.save(
                        noteConverter.convertDtoToModel(noteDto)
                ));
    }

    @PutMapping("/{id}")
    public NoteDto update(@PathVariable Integer id, @RequestBody NoteDto noteDto) {
        Note note = noteConverter.convertDtoToModel(noteDto);
        note.setId(id);

        return noteConverter.convertModelToDto(
                noteService.update(note));
    }
}
