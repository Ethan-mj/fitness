package com.fitness.booking.entity;

import javax.persistence.*;

@Entity
@Table(name = "member_avatars")
public class MemberAvatar {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(optional = false) @JoinColumn(name = "user_id", unique = true, nullable = false)
    private AppUser user;
    @Column(nullable = false, length = 50)
    private String contentType;
    @Lob @Column(nullable = false, columnDefinition = "MEDIUMBLOB")
    private byte[] content;

    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public byte[] getContent() { return content; }
    public void setContent(byte[] content) { this.content = content; }
}
