package com.fitness.booking.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
public class LessonChange {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private AppUser user;
    @ManyToOne(optional = false)
    private AppUser operator;
    @Column(nullable = false)
    private int amount;
    private String note;
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public AppUser getOperator() { return operator; }
    public void setOperator(AppUser operator) { this.operator = operator; }
    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
