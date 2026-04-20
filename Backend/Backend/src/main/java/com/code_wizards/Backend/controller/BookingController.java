package com.code_wizards.Backend.controller;

import com.code_wizards.Backend.dto.VerifyResponse;
import com.code_wizards.Backend.entity.Booking;
import com.code_wizards.Backend.entity.BookingStatus;
import com.code_wizards.Backend.entity.BookingStatusHistory;
import com.code_wizards.Backend.repository.BookingRepository;

import com.code_wizards.Backend.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin("*") // Enable CORS for React frontend

public class BookingController {
    private final BookingService bookingService;
    private final BookingRepository bookingRepository;

   
    public BookingController(BookingService bookingService, BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
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
            @RequestParam(required = false) BookingStatus status,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        // Check if user is authenticated
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        List<Booking> bookings;

        // ADMIN sees all bookings
        if ("ADMIN".equalsIgnoreCase(userRole)) {
            bookings = (status != null)
                    ? bookingService.getAllBookingsByStatus(status)
                    : bookingService.getAllBookings();
        }
        // Regular users see only their bookings
        else {
            bookings = bookingService.getBookingsByUserId(userId);
            if (status != null) {
                bookings = bookings.stream()
                        .filter(b -> b.getStatus() == status)
                        .collect(Collectors.toList());
            }
        }

        return ResponseEntity.ok(bookings);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long id) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(bookingService.approveBooking(id, userId));
    }

    // Public endpoint (no auth headers required)
    @GetMapping("/verify/{token}")
    public ResponseEntity<VerifyResponse> verifyBooking(@PathVariable String token) {
        return ResponseEntity.ok(bookingService.verifyBooking(token));
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
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason, userId));
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
            @RequestParam Long resourceId,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime) {

        LocalDate bookingDate = LocalDate.parse(date);
        LocalTime start = LocalTime.parse(startTime);
        LocalTime end = LocalTime.parse(endTime);

        boolean available = bookingService.checkAvailability(resourceId, bookingDate, start, end);
        return ResponseEntity.ok(Map.of("available", available));
    }

        /**
         * Returns all APPROVED booked time slots for a resource on a specific date.
         * Used by the frontend to display the visual timeline in BookingModal.
         */
        @GetMapping("/booked-slots")
        public ResponseEntity<List<Map<String, String>>> getBookedSlots(
            @RequestParam Long resourceId,
            @RequestParam String date) {

        LocalDate bookingDate = LocalDate.parse(date);
        LocalDateTime startOfDay = bookingDate.atStartOfDay();
        LocalDateTime endOfDay = bookingDate.atTime(23, 59, 59);

        // Only show APPROVED bookings (not pending — those aren't confirmed yet)
        List<BookingStatus> approvedStatus = List.of(BookingStatus.APPROVED);

        List<Booking> bookedSlots = bookingRepository.findOverlappingBookings(
            resourceId, startOfDay, endOfDay, approvedStatus);

        List<Map<String, String>> result = bookedSlots.stream()
            .map(b -> Map.of(
                "startTime", b.getStartTime().toLocalTime().toString(),
                "endTime", b.getEndTime().toLocalTime().toString(),
                "purpose", b.getPurpose() != null ? b.getPurpose() : ""
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/free-slots")
    public ResponseEntity<List<Map<String, String>>> getFreeSlots(
            @RequestParam Long resourceId,
            @RequestParam String date) {

        LocalDate bookingDate = LocalDate.parse(date);
        return ResponseEntity.ok(bookingService.getFreeSlots(resourceId, bookingDate));
    }
}


    

