package com.fitness.booking.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fitness.booking.entity.*;
import com.fitness.booking.repository.MemberAvatarRepository;
import java.io.IOException;
import java.util.*;

@Service
public class FileStorageService {
    private static final Set<String> ALLOWED_TYPES = new HashSet<String>(
            Arrays.asList("image/jpeg", "image/png", "image/webp"));
    private final MemberAvatarRepository avatars;

    public FileStorageService(MemberAvatarRepository avatars) { this.avatars = avatars; }

    public String storeAvatar(AppUser user, MultipartFile file) {
        if (file == null || file.isEmpty()) return null;
        if (!ALLOWED_TYPES.contains(file.getContentType())) throw new IllegalArgumentException("头像仅支持 JPG、PNG 或 WebP 格式");
        if (file.getSize() > 5 * 1024 * 1024) throw new IllegalArgumentException("头像大小不能超过 5MB");
        try {
            MemberAvatar avatar = new MemberAvatar();
            avatar.setUser(user); avatar.setContentType(file.getContentType()); avatar.setContent(file.getBytes());
            avatars.save(avatar);
            return "/api/public/members/" + user.getId() + "/avatar";
        } catch (IOException e) {
            throw new IllegalStateException("头像保存失败，请重试");
        }
    }
}
