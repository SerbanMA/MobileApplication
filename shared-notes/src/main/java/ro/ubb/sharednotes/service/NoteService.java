package ro.ubb.sharednotes.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ro.ubb.sharednotes.domain.Note;
import ro.ubb.sharednotes.repository.NoteRepository;

import javax.transaction.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;

    public List<Note> getAll() {
        return noteRepository.findAll();
    }

    public Note save(Note note) {
        return noteRepository.save(note);
    }

    @Transactional
    public Note update(Note note) {
        return noteRepository.save(note);
    }
}
