package com.code_wizards.Backend.controller;

import com.code_wizards.Backend.entity.Booking;
import com.code_wizards.Backend.entity.BookingStatus;
import com.code_wizards.Backend.entity.BookingStatusHistory;

import com.code_wizards.Backend.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin("*") // Enable CORS for React frontend

public class BookingController {
    private final BookingService bookingService;

   
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Booking booking) {
        booking.setUserId(userId);
        return ResponseEntity.ok(bookingService.createBookingRequest(booking));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @RequestBody Booking booking) {
        booking.setUserId(userId);
        return ResponseEntity.ok(bookingService.updateBooking(id, booking));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long id) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")

    public ResponseEntity<List<Booking>> getMyBookings(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestHeader("X-User-Role") String role,
            @RequestParam(required = false) BookingStatus status) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        if (status != null) {
            return ResponseEntity.ok(bookingService.getAllBookingsByStatus(status));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long id) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        String reason = body.getOrDefault("reason", "No reason provided");
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
    }


    @GetMapping("/{id}/history")
    public ResponseEntity<List<BookingStatusHistory>> getBookingHistory(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingHistory(id));
    }
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }

    @GetMapping("/availability")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @RequestParam String resourceId,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime) {

        LocalDate bookingDate = LocalDate.parse(date);
        LocalTime start = LocalTime.parse(startTime);
        LocalTime end = LocalTime.parse(endTime);

        boolean available = bookingService.checkAvailability(resourceId, bookingDate, start, end);
        return ResponseEntity.ok(Map.of("available", available));
    }
}

    

