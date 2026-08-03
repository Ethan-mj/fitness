package com.fitness.booking.repository;

import com.fitness.booking.entity.MemberAvatar;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberAvatarRepository extends JpaRepository<MemberAvatar, Long> {
    Optional<MemberAvatar> findByUserId(Long userId);
}
