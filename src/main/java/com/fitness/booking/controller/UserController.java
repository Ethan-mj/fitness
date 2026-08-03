package com.fitness.booking.controller;

import com.fitness.booking.dto.ApiDtos.*;
import com.fitness.booking.entity.*;
import com.fitness.booking.repository.*;
import com.fitness.booking.service.*;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class UserController {
    private final AppUserRepository users;
    private final CoachRepository coaches;
    private final CoachSlotRepository slots;
    private final BookingRepository bookings;
    private final BookingService bookingService;
    private final MemberAvatarRepository avatars;

    public UserController(AppUserRepository users, CoachRepository coaches, CoachSlotRepository slots,
                          BookingRepository bookings, BookingService bookingService, MemberAvatarRepository avatars) {
        this.users = users; this.coaches = coaches; this.slots = slots;
        this.bookings = bookings; this.bookingService = bookingService; this.avatars = avatars;
    }

    @GetMapping("/members/{id}/avatar")
    public ResponseEntity<byte[]> avatar(@PathVariable Long id) {
        MemberAvatar avatar = avatars.findByUserId(id).orElseThrow(() -> new IllegalArgumentException("头像不存在"));
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(avatar.getContentType()))
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                .body(avatar.getContent());
    }

    @GetMapping("/members")
    public List<MemberOptionResponse> members() {
        return users.findAll().stream().filter(u -> u.getRole() == AppUser.Role.USER)
                .map(u -> new MemberOptionResponse(u.getId(), u.getNickname(), u.getAvatarUrl(), u.getRemainingLessons()))
                .collect(Collectors.toList());
    }

    @GetMapping("/coaches")
    public List<CoachResponse> coaches() {
        return coaches.findByActiveTrueOrderByCreatedAtDesc().stream().map(UserController::coach).collect(Collectors.toList());
    }

    @GetMapping("/slots")
    public List<SlotResponse> slots(@RequestParam(required = false) Long coachId) {
        List<CoachSlot> result = coachId == null
                ? slots.findByStartTimeAfterAndBookedFalseOrderByStartTime(LocalDateTime.now())
                : slots.findByCoachIdAndStartTimeAfterAndBookedFalseOrderByStartTime(coachId, LocalDateTime.now());
        return result.stream().map(s -> new SlotResponse(s.getId(), s.getCoach().getId(), s.getCoach().getName(),
                s.getStartTime(), s.getEndTime())).collect(Collectors.toList());
    }

    @GetMapping("/bookings")
    public List<BookingResponse> bookings(@RequestParam Long memberId) {
        return bookings.findByUserIdOrderByCreatedAtDesc(memberId).stream().map(UserController::booking).collect(Collectors.toList());
    }

    @PostMapping("/bookings")
    public BookingResponse book(@Valid @RequestBody CreateBookingRequest request) {
        return booking(bookingService.create(request.getMemberId(), request.getSlotId()));
    }

    @PostMapping("/bookings/{id}/cancel")
    public void cancel(@PathVariable Long id, @Valid @RequestBody CancelBookingRequest request) {
        bookingService.cancel(request.getMemberId(), id);
    }

    static CoachResponse coach(Coach c) {
        return new CoachResponse(c.getId(), c.getName(), c.getSpecialty(), c.getIntroduction(), c.getAvatarUrl(), c.isActive());
    }
    static BookingResponse booking(Booking b) {
        return new BookingResponse(b.getId(), b.getCoach().getName(), b.getCoach().getSpecialty(),
                b.getSlot().getStartTime(), b.getSlot().getEndTime(), b.getStatus().name(),
                b.getUser().getNickname(), b.getUser().getId());
    }
}
