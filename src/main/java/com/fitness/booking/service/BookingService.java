package com.fitness.booking.service;

import com.fitness.booking.entity.*;
import com.fitness.booking.repository.*;
import javax.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class BookingService {
    private final BookingRepository bookings;
    private final CoachSlotRepository slots;
    private final AppUserRepository users;

    public BookingService(BookingRepository bookings, CoachSlotRepository slots, AppUserRepository users) {
        this.bookings = bookings; this.slots = slots; this.users = users;
    }

    @Transactional
    public Booking create(Long memberId, Long slotId) {
        AppUser lockedUser = users.findByIdForUpdate(memberId).orElseThrow(() -> new IllegalArgumentException("会员不存在"));
        if (lockedUser.getRole() != AppUser.Role.USER) throw new IllegalArgumentException("预约人不是会员");
        CoachSlot slot = slots.findByIdForUpdate(slotId).orElseThrow(() -> new IllegalArgumentException("该时段不存在"));
        if (slot.isBooked()) throw new IllegalStateException("该时段已被预约");
        if (slot.getStartTime().isBefore(LocalDateTime.now())) throw new IllegalStateException("不能预约已开始的课程");
        if (lockedUser.getRemainingLessons() < 1) throw new IllegalStateException("剩余课时不足，请联系管理员充值");
        lockedUser.setRemainingLessons(lockedUser.getRemainingLessons() - 1);
        slot.setBooked(true);
        Booking booking = new Booking();
        booking.setUser(lockedUser); booking.setCoach(slot.getCoach()); booking.setSlot(slot);
        return bookings.save(booking);
    }

    @Transactional
    public void cancel(Long memberId, Long bookingId) {
        Booking booking = bookings.findById(bookingId).orElseThrow(() -> new IllegalArgumentException("预约不存在"));
        if (!booking.getUser().getId().equals(memberId)) throw new SecurityException("预约会员不匹配");
        if (booking.getStatus() != Booking.Status.BOOKED) throw new IllegalStateException("预约已取消或完成");
        if (booking.getSlot().getStartTime().isBefore(LocalDateTime.now().plusHours(2)))
            throw new IllegalStateException("开课前 2 小时内不可取消，请联系管理员");
        booking.setStatus(Booking.Status.CANCELLED);
        booking.getSlot().setBooked(false);
        AppUser user = users.findByIdForUpdate(memberId).orElseThrow(() -> new IllegalArgumentException("会员不存在"));
        user.setRemainingLessons(user.getRemainingLessons() + 1);
    }
}
