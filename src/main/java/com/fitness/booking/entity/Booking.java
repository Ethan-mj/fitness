package com.fitness.booking.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Booking {
    public enum Status { BOOKED, CANCELLED, COMPLETED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private AppUser user;
    @ManyToOne(optional = false)
    private Coach coach;
    @OneToOne(optional = false)
    private CoachSlot slot;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Status status = Status.BOOKED;
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public Coach getCoach() { return coach; }
    public void setCoach(Coach coach) { this.coach = coach; }
    public CoachSlot getSlot() { return slot; }
    public void setSlot(CoachSlot slot) { this.slot = slot; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
