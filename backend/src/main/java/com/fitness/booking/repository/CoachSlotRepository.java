package com.fitness.booking.repository;

import com.fitness.booking.entity.CoachSlot;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import javax.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CoachSlotRepository extends JpaRepository<CoachSlot, Long> {
    List<CoachSlot> findByStartTimeAfterAndBookedFalseOrderByStartTime(LocalDateTime now);
    List<CoachSlot> findByCoachIdAndStartTimeAfterAndBookedFalseOrderByStartTime(Long coachId, LocalDateTime now);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from CoachSlot s where s.id = :id")
    Optional<CoachSlot> findByIdForUpdate(@Param("id") Long id);
}
