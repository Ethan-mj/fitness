package com.fitness.booking.controller;

import com.fitness.booking.dto.ApiDtos.*;
import com.fitness.booking.entity.*;
import com.fitness.booking.repository.*;
import com.fitness.booking.service.CurrentUserService;
import com.fitness.booking.service.FileStorageService;
import javax.transaction.Transactional;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AppUserRepository users;
    private final CoachRepository coaches;
    private final CoachSlotRepository slots;
    private final BookingRepository bookings;
    private final LessonChangeRepository changes;
    private final CurrentUserService current;
    private final FileStorageService files;

    public AdminController(AppUserRepository users, CoachRepository coaches, CoachSlotRepository slots,
                           BookingRepository bookings, LessonChangeRepository changes, CurrentUserService current,
                           FileStorageService files) {
        this.users = users; this.coaches = coaches; this.slots = slots;
        this.bookings = bookings; this.changes = changes; this.current = current; this.files = files;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        long userCount = users.findAll().stream().filter(u -> u.getRole() == AppUser.Role.USER).count();
        long coachCount = coaches.findAll().stream().filter(Coach::isActive).count();
        long active = bookings.findAll().stream().filter(b -> b.getStatus() == Booking.Status.BOOKED).count();
        long lessons = users.findAll().stream().filter(u -> u.getRole() == AppUser.Role.USER)
                .mapToLong(AppUser::getRemainingLessons).sum();
        return new DashboardResponse(userCount, coachCount, active, lessons);
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return users.findAll().stream().filter(u -> u.getRole() == AppUser.Role.USER)
                .map(AdminController::userResponse)
                .collect(Collectors.toList());
    }

    @PostMapping(value = "/users", consumes = "multipart/form-data")
    public UserResponse createUser(@RequestParam String nickname,
                                   @RequestParam(required = false) String phone,
                                   @RequestParam(defaultValue = "0") int initialLessons,
                                   @RequestParam(required = false) MultipartFile avatar) {
        if (nickname == null || nickname.trim().isEmpty()) throw new IllegalArgumentException("会员姓名不能为空");
        if (initialLessons < 0 || initialLessons > 999) throw new IllegalArgumentException("初始课时应在 0 到 999 之间");
        AppUser user = new AppUser();
        user.setNickname(nickname.trim()); user.setPhone(phone == null ? null : phone.trim());
        user.setRemainingLessons(initialLessons); user = users.save(user);
        user.setAvatarUrl(files.storeAvatar(user, avatar));
        return userResponse(users.save(user));
    }

    @Transactional
    @PostMapping(value = "/users/json", consumes = "application/json")
    public UserResponse createUserJson(@Valid @RequestBody CreateMemberJsonRequest request) {
        AppUser user = new AppUser();
        user.setNickname(request.getNickname().trim());
        user.setPhone(request.getPhone() == null || request.getPhone().trim().isEmpty() ? null : request.getPhone().trim());
        user.setRemainingLessons(request.getInitialLessons());
        user = users.save(user);
        user.setAvatarUrl(files.storeAvatar(user, request.getAvatarContentType(), request.getAvatarBase64()));
        return userResponse(users.save(user));
    }

    @Transactional
    @PostMapping("/users/{id}/lessons")
    public UserResponse adjustLessons(@PathVariable Long id, @Valid @RequestBody LessonAdjustRequest request) {
        if (request.getAmount() == 0) throw new IllegalArgumentException("调整课时不能为 0");
        AppUser user = users.findByIdForUpdate(id).orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        if (user.getRole() != AppUser.Role.USER) throw new IllegalArgumentException("只能调整会员课时");
        int next = user.getRemainingLessons() + request.getAmount();
        if (next < 0) throw new IllegalStateException("扣减后课时不能小于 0");
        user.setRemainingLessons(next);
        LessonChange change = new LessonChange();
        change.setUser(user); change.setOperator(current.get()); change.setAmount(request.getAmount()); change.setNote(request.getNote());
        changes.save(change);
        return userResponse(user);
    }

    @GetMapping("/coaches")
    public List<CoachResponse> coaches() { return coaches.findAll().stream().map(UserController::coach).collect(Collectors.toList()); }

    @PostMapping("/coaches")
    public CoachResponse createCoach(@Valid @RequestBody CreateCoachRequest request) {
        Coach c = new Coach(); c.setName(request.getName()); c.setSpecialty(request.getSpecialty());
        c.setIntroduction(request.getIntroduction()); c.setAvatarUrl(request.getAvatarUrl());
        return UserController.coach(coaches.save(c));
    }

    @PatchMapping("/coaches/{id}/active")
    public CoachResponse active(@PathVariable Long id, @RequestParam boolean value) {
        Coach c = coaches.findById(id).orElseThrow(() -> new IllegalArgumentException("教练不存在"));
        c.setActive(value); return UserController.coach(coaches.save(c));
    }

    @PostMapping("/slots")
    public SlotResponse createSlot(@Valid @RequestBody CreateSlotRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) throw new IllegalArgumentException("结束时间必须晚于开始时间");
        Coach c = coaches.findById(request.getCoachId()).orElseThrow(() -> new IllegalArgumentException("教练不存在"));
        CoachSlot s = new CoachSlot(); s.setCoach(c); s.setStartTime(request.getStartTime()); s.setEndTime(request.getEndTime());
        s = slots.save(s);
        return new SlotResponse(s.getId(), c.getId(), c.getName(), s.getStartTime(), s.getEndTime());
    }

    @GetMapping("/bookings")
    public List<BookingResponse> bookings() {
        return bookings.findAllByOrderByCreatedAtDesc().stream().map(UserController::booking).collect(Collectors.toList());
    }

    private static UserResponse userResponse(AppUser user) {
        return new UserResponse(user.getId(), user.getNickname(), user.getPhone(), user.getAvatarUrl(),
                user.getRemainingLessons(), user.getCreatedAt());
    }
}
