package ro.ubb.sharednotes.domain;

import lombok.Data;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import java.io.Serializable;

@MappedSuperclass
@Data
public class BaseEntity implements Serializable {
    @Id
    @GeneratedValue
    private Integer id;
}
