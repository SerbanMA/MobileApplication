package ro.ubb.sharednotes.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ro.ubb.sharednotes.domain.User;
import ro.ubb.sharednotes.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<User> getAll() {
        return userRepository.findAll();
    }
}
