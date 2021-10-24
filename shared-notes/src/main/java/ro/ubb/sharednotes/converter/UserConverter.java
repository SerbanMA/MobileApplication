package ro.ubb.sharednotes.converter;

import org.springframework.stereotype.Component;
import ro.ubb.sharednotes.domain.User;
import ro.ubb.sharednotes.dto.UserDto;

@Component
public class UserConverter implements BaseConverter<UserDto, User> {
    @Override
    public UserDto convertModelToDto(User model) {
        return UserDto.builder()
                .id(model.getId())
                .email(model.getEmail())
                .password(model.getPassword())
                .firstName(model.getFirstName())
                .lastName(model.getLastName())
                .build();
    }

    @Override
    public User convertDtoToModel(UserDto dto) {
        User user = User.builder()
                .email(dto.getEmail())
                .password(dto.getPassword())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .build();
        user.setId(dto.getId());
        return user;
    }
}
