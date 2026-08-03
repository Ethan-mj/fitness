package com.fitness.booking.config;

import com.fitness.booking.entity.*;
import com.fitness.booking.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.*;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seed(AppUserRepository users, CoachRepository coaches, CoachSlotRepository slots,
                           PasswordEncoder encoder,
                           @Value("${app.admin.initial-password:Fit@2026}") String adminPassword,
                           @Value("${app.admin.initialize-enabled:true}") boolean initializeAdmin,
                           @Value("${app.seed-enabled:true}") boolean seedEnabled) {
        return args -> {
            if (initializeAdmin && users.findByNicknameAndRole("admin", AppUser.Role.ADMIN).isEmpty()) {
                AppUser admin = new AppUser();
                admin.setNickname("admin"); admin.setRole(AppUser.Role.ADMIN);
                admin.setPasswordHash(encoder.encode(adminPassword));
                users.save(admin);
            }
            if (!seedEnabled || coaches.count() > 0) return;

            if (users.findByNicknameAndRole("林小满", AppUser.Role.USER).isEmpty()) {
                AppUser member = new AppUser();
                member.setNickname("林小满"); member.setRemainingLessons(8);
                users.save(member);
            }

            Coach c1 = coach("陈野", "力量塑形", "ACE 认证教练，擅长力量训练与体态改善。", "CY");
            Coach c2 = coach("苏晴", "普拉提 · 核心", "专注女性体态管理与核心稳定训练。", "SQ");
            Coach c3 = coach("周燃", "燃脂体能", "用循序渐进的训练，让运动真正成为习惯。", "ZR");
            coaches.save(c1); coaches.save(c2); coaches.save(c3);

            LocalDate start = LocalDate.now().plusDays(1);
            Coach[] roster = {c1, c2, c3};
            for (int day = 0; day < 6; day++) {
                for (int i = 0; i < roster.length; i++) {
                    int hour = 9 + i * 5 + (day % 2);
                    CoachSlot s = new CoachSlot();
                    s.setCoach(roster[i]); s.setStartTime(start.plusDays(day).atTime(hour, 0));
                    s.setEndTime(start.plusDays(day).atTime(hour + 1, 0)); slots.save(s);
                }
            }
        };
    }

    private Coach coach(String name, String specialty, String intro, String avatar) {
        Coach c = new Coach(); c.setName(name); c.setSpecialty(specialty);
        c.setIntroduction(intro); c.setAvatarUrl(avatar); return c;
    }
}
