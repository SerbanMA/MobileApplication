package ro.ubb.sharednotes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.ubb.sharednotes.domain.Note;

@Repository
public interface NoteRepository extends JpaRepository<Note, Integer> {
}
