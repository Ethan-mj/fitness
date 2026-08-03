package com.fitness.booking.controller;

import com.fitness.booking.dto.ApiDtos.*;
import com.fitness.booking.entity.AppUser;
import com.fitness.booking.repository.AppUserRepository;
import com.fitness.booking.security.JwtService;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AppUserRepository users;
    private final JwtService jwt;
    private final PasswordEncoder encoder;
    private final String expectedWechatAppId;
    private final String adminWechatOpenIds;
    private final boolean passwordLoginEnabled;

    public AuthController(AppUserRepository users, JwtService jwt, PasswordEncoder encoder,
                          @Value("${app.wechat.app-id:}") String expectedWechatAppId,
                          @Value("${app.admin.wechat-openids:}") String adminWechatOpenIds,
                          @Value("${app.admin.password-login-enabled:true}") boolean passwordLoginEnabled) {
        this.users = users; this.jwt = jwt; this.encoder = encoder;
        this.expectedWechatAppId = expectedWechatAppId;
        this.adminWechatOpenIds = adminWechatOpenIds;
        this.passwordLoginEnabled = passwordLoginEnabled;
    }

    @PostMapping("/admin")
    public AuthResponse admin(@Valid @RequestBody AdminLoginRequest request) {
        if (!passwordLoginEnabled) throw new SecurityException("云环境已关闭账号密码登录，请使用微信授权登录");
        AppUser user = users.findByNicknameAndRole(request.getUsername(), AppUser.Role.ADMIN)
                .filter(u -> encoder.matches(request.getPassword(), u.getPasswordHash()))
                .orElseThrow(() -> new IllegalArgumentException("账号或密码错误"));
        return new AuthResponse(jwt.create(user), user.getRole().name(), user.getId(), user.getNickname());
    }

    @GetMapping("/wechat/identity")
    public WechatIdentityResponse wechatIdentity(
            @RequestHeader(value = "X-WX-OPENID", required = false) String openId,
            @RequestHeader(value = "X-WX-APPID", required = false) String appId) {
        String trustedOpenId = requireWechatIdentity(openId, appId);
        return new WechatIdentityResponse(trustedOpenId, isAdminOpenId(trustedOpenId));
    }

    @PostMapping("/wechat/admin")
    public AuthResponse wechatAdmin(
            @RequestHeader(value = "X-WX-OPENID", required = false) String openId,
            @RequestHeader(value = "X-WX-APPID", required = false) String appId) {
        String trustedOpenId = requireWechatIdentity(openId, appId);
        if (!isAdminOpenId(trustedOpenId)) throw new SecurityException("当前微信未配置为管理员");
        AppUser user = users.findByNicknameAndRole("admin", AppUser.Role.ADMIN)
                .orElseThrow(() -> new IllegalStateException("管理员资料尚未初始化，请检查启动配置"));
        return new AuthResponse(jwt.create(user), user.getRole().name(), user.getId(), user.getNickname());
    }

    private String requireWechatIdentity(String openId, String appId) {
        if (openId == null || openId.trim().isEmpty()) {
            throw new SecurityException("未获取到微信身份，请通过小程序 callContainer 访问");
        }
        if (!expectedWechatAppId.isEmpty() && !expectedWechatAppId.equals(appId)) {
            throw new SecurityException("小程序身份不匹配");
        }
        return openId.trim();
    }

    private boolean isAdminOpenId(String openId) {
        for (String candidate : adminWechatOpenIds.split(",")) {
            if (openId.equals(candidate.trim())) return true;
        }
        return false;
    }
}
