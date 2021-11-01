package ro.ubb.sharednotes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserDto implements Serializable {
    private String id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
}
