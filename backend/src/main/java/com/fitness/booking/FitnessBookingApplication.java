package com.fitness.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class FitnessBookingApplication {
    public static void main(String[] args) {
        SpringApplication.run(FitnessBookingApplication.class, args);
    }
}
