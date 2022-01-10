package ro.ubb.sharednotes.domain;

import lombok.*;

import javax.persistence.Entity;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import java.util.Date;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@Table(name = "notes")
public class Note extends BaseEntity {
    private String title;
    private String message;
    private Boolean done;
    private Date lastChange;
    private Integer characters;
    @ManyToMany(mappedBy = "notes")
    private List<User> users;
}