package com.fitness.booking.repository;

import com.fitness.booking.entity.Coach;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoachRepository extends JpaRepository<Coach, Long> {
    List<Coach> findByActiveTrueOrderByCreatedAtDesc();
}
