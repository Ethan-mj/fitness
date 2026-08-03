package com.fitness.booking.service;

import com.fitness.booking.entity.AppUser;
import com.fitness.booking.repository.AppUserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    private final AppUserRepository users;
    public CurrentUserService(AppUserRepository users) { this.users = users; }
    public AppUser get() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return users.findById((Long) principal)
                .orElseThrow(() -> new IllegalStateException("当前管理员不存在"));
    }
}
