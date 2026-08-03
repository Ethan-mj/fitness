package com.fitness.booking.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
public class AppUser {
    public enum Role { USER, ADMIN }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String nickname;
    private String phone;
    private String avatarUrl;
    private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Role role = Role.USER;
    @Column(nullable = false)
    private int remainingLessons;
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public int getRemainingLessons() { return remainingLessons; }
    public void setRemainingLessons(int remainingLessons) { this.remainingLessons = remainingLessons; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
