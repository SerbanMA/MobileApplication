package ro.ubb.sharednotes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.ubb.sharednotes.domain.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
}
