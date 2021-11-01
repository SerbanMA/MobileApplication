package ro.ubb.sharednotes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class NoteDto implements Serializable {
    private String id;
    private String title;
    private String message;
    private Boolean done;
    private Integer characters;
    private Date lastChange;
}
