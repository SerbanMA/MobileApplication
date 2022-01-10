package ro.ubb.sharednotes.domain;

import lombok.*;

import javax.persistence.*;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@Table(name = "users")
public class User extends BaseEntity {
    @Column(unique = true)
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    @ManyToMany
    @JoinTable(
            name = "users_notes",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "note_id")
    )
    private List<Note> notes;
}
