package ro.ubb.sharednotes.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.ubb.sharednotes.converter.UserConverter;
import ro.ubb.sharednotes.dto.UserDto;
import ro.ubb.sharednotes.service.UserService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final UserConverter userConverter;

    @GetMapping
    public List<UserDto> getUsers() {
        return userConverter.convertModelsToDtos(
                userService.getAll()
        );
    }
}
