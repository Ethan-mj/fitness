package com.fitness.booking.controller;

import com.fitness.booking.dto.ApiDtos.*;
import com.fitness.booking.entity.AppUser;
import com.fitness.booking.repository.AppUserRepository;
import com.fitness.booking.security.JwtService;
import javax.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AppUserRepository users;
    private final JwtService jwt;
    private final PasswordEncoder encoder;

    public AuthController(AppUserRepository users, JwtService jwt, PasswordEncoder encoder) {
        this.users = users; this.jwt = jwt; this.encoder = encoder;
    }

    @PostMapping("/admin")
    public AuthResponse admin(@Valid @RequestBody AdminLoginRequest request) {
        AppUser user = users.findByNicknameAndRole(request.getUsername(), AppUser.Role.ADMIN)
                .filter(u -> encoder.matches(request.getPassword(), u.getPasswordHash()))
                .orElseThrow(() -> new IllegalArgumentException("账号或密码错误"));
        return new AuthResponse(jwt.create(user), user.getRole().name(), user.getId(), user.getNickname());
    }
}
