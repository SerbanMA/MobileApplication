package ro.ubb.sharednotes.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.ubb.sharednotes.converter.NoteConverter;
import ro.ubb.sharednotes.dto.NoteDto;
import ro.ubb.sharednotes.service.NoteService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notes")
public class NoteController {
    private final NoteService noteService;
    private final NoteConverter noteConverter;

    @GetMapping
    public List<NoteDto> getAll() {
        return noteConverter.convertModelsToDtos(
                noteService.getAll()
        );
    }
}
