package com.fitness.booking.dto;

import javax.validation.constraints.*;
import java.time.LocalDateTime;

public final class ApiDtos {
    private ApiDtos() {}

    public static class AdminLoginRequest {
        @NotBlank private String username;
        @NotBlank private String password;
        public AdminLoginRequest() {}
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private final String token; private final String role; private final Long userId; private final String nickname;
        public AuthResponse(String token, String role, Long userId, String nickname) { this.token = token; this.role = role; this.userId = userId; this.nickname = nickname; }
        public String getToken() { return token; } public String getRole() { return role; }
        public Long getUserId() { return userId; } public String getNickname() { return nickname; }
    }

    public static class CoachResponse {
        private final Long id; private final String name; private final String specialty; private final String introduction; private final String avatarUrl; private final boolean active;
        public CoachResponse(Long id, String name, String specialty, String introduction, String avatarUrl, boolean active) { this.id = id; this.name = name; this.specialty = specialty; this.introduction = introduction; this.avatarUrl = avatarUrl; this.active = active; }
        public Long getId() { return id; } public String getName() { return name; } public String getSpecialty() { return specialty; }
        public String getIntroduction() { return introduction; } public String getAvatarUrl() { return avatarUrl; } public boolean isActive() { return active; }
    }

    public static class SlotResponse {
        private final Long id; private final Long coachId; private final String coachName; private final LocalDateTime startTime; private final LocalDateTime endTime;
        public SlotResponse(Long id, Long coachId, String coachName, LocalDateTime startTime, LocalDateTime endTime) { this.id = id; this.coachId = coachId; this.coachName = coachName; this.startTime = startTime; this.endTime = endTime; }
        public Long getId() { return id; } public Long getCoachId() { return coachId; } public String getCoachName() { return coachName; }
        public LocalDateTime getStartTime() { return startTime; } public LocalDateTime getEndTime() { return endTime; }
    }

    public static class CreateBookingRequest {
        @NotNull private Long memberId; @NotNull private Long slotId;
        public CreateBookingRequest() {}
        public Long getMemberId() { return memberId; } public void setMemberId(Long memberId) { this.memberId = memberId; }
        public Long getSlotId() { return slotId; } public void setSlotId(Long slotId) { this.slotId = slotId; }
    }

    public static class CancelBookingRequest {
        @NotNull private Long memberId;
        public CancelBookingRequest() {}
        public Long getMemberId() { return memberId; } public void setMemberId(Long memberId) { this.memberId = memberId; }
    }

    public static class BookingResponse {
        private final Long id; private final String coachName; private final String specialty; private final LocalDateTime startTime;
        private final LocalDateTime endTime; private final String status; private final String userName; private final Long userId;
        public BookingResponse(Long id, String coachName, String specialty, LocalDateTime startTime, LocalDateTime endTime, String status, String userName, Long userId) { this.id = id; this.coachName = coachName; this.specialty = specialty; this.startTime = startTime; this.endTime = endTime; this.status = status; this.userName = userName; this.userId = userId; }
        public Long getId() { return id; } public String getCoachName() { return coachName; } public String getSpecialty() { return specialty; }
        public LocalDateTime getStartTime() { return startTime; } public LocalDateTime getEndTime() { return endTime; }
        public String getStatus() { return status; } public String getUserName() { return userName; } public Long getUserId() { return userId; }
    }

    public static class CreateCoachRequest {
        @NotBlank private String name; @NotBlank private String specialty; private String introduction; private String avatarUrl;
        public CreateCoachRequest() {}
        public String getName() { return name; } public void setName(String name) { this.name = name; }
        public String getSpecialty() { return specialty; } public void setSpecialty(String specialty) { this.specialty = specialty; }
        public String getIntroduction() { return introduction; } public void setIntroduction(String introduction) { this.introduction = introduction; }
        public String getAvatarUrl() { return avatarUrl; } public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public static class CreateSlotRequest {
        @NotNull private Long coachId; @NotNull private LocalDateTime startTime; @NotNull private LocalDateTime endTime;
        public CreateSlotRequest() {}
        public Long getCoachId() { return coachId; } public void setCoachId(Long coachId) { this.coachId = coachId; }
        public LocalDateTime getStartTime() { return startTime; } public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
        public LocalDateTime getEndTime() { return endTime; } public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    }

    public static class LessonAdjustRequest {
        @Min(-999) @Max(999) private int amount; private String note;
        public LessonAdjustRequest() {}
        public int getAmount() { return amount; } public void setAmount(int amount) { this.amount = amount; }
        public String getNote() { return note; } public void setNote(String note) { this.note = note; }
    }

    public static class MemberOptionResponse {
        private final Long id; private final String nickname; private final String avatarUrl; private final int remainingLessons;
        public MemberOptionResponse(Long id, String nickname, String avatarUrl, int remainingLessons) { this.id = id; this.nickname = nickname; this.avatarUrl = avatarUrl; this.remainingLessons = remainingLessons; }
        public Long getId() { return id; } public String getNickname() { return nickname; }
        public String getAvatarUrl() { return avatarUrl; } public int getRemainingLessons() { return remainingLessons; }
    }

    public static class UserResponse {
        private final Long id; private final String nickname; private final String phone; private final String avatarUrl;
        private final int remainingLessons; private final LocalDateTime createdAt;
        public UserResponse(Long id, String nickname, String phone, String avatarUrl, int remainingLessons, LocalDateTime createdAt) { this.id = id; this.nickname = nickname; this.phone = phone; this.avatarUrl = avatarUrl; this.remainingLessons = remainingLessons; this.createdAt = createdAt; }
        public Long getId() { return id; } public String getNickname() { return nickname; } public String getPhone() { return phone; }
        public String getAvatarUrl() { return avatarUrl; } public int getRemainingLessons() { return remainingLessons; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    public static class DashboardResponse {
        private final long users; private final long coaches; private final long activeBookings; private final long lessonsRemaining;
        public DashboardResponse(long users, long coaches, long activeBookings, long lessonsRemaining) { this.users = users; this.coaches = coaches; this.activeBookings = activeBookings; this.lessonsRemaining = lessonsRemaining; }
        public long getUsers() { return users; } public long getCoaches() { return coaches; }
        public long getActiveBookings() { return activeBookings; } public long getLessonsRemaining() { return lessonsRemaining; }
    }
}
