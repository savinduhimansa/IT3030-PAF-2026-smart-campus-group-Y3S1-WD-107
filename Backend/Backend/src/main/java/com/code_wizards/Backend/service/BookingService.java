package com.code_wizards.Backend.service;

import com.code_wizards.Backend.dto.VerifyResponse;
import com.code_wizards.Backend.entity.Booking;
import com.code_wizards.Backend.entity.BookingStatus;
import com.code_wizards.Backend.entity.BookingStatusHistory;
import com.code_wizards.Backend.entity.Resource;
import com.code_wizards.Backend.entity.ResourceStatus;
import com.code_wizards.Backend.exception.BookingNotFoundException;
import com.code_wizards.Backend.repository.BookingHistoryRepository;
import com.code_wizards.Backend.repository.BookingRepository;
import com.code_wizards.Backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingHistoryRepository bookingStatusHistoryRepository;
    private final ResourceRepository resourceRepository;

    @Transactional
    public Booking updateBooking(Long id, Booking updatedBooking) {
        Booking booking = getBooking(id);
        // Only allow update if booking is still pending
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be updated.");
        }

        booking.setResource(requireBookableActiveResource(updatedBooking.getResourceId()));
        booking.setStartTime(updatedBooking.getStartTime());
        booking.setEndTime(updatedBooking.getEndTime());
        booking.setPurpose(updatedBooking.getPurpose());
        booking.setExpectedAttendees(updatedBooking.getExpectedAttendees());
        booking.setContactEmail(updatedBooking.getContactEmail());
        booking.setDepartment(updatedBooking.getDepartment());
        booking.setSpecialReqs(updatedBooking.getSpecialReqs());
        return bookingRepository.save(booking);
    }

    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = getBooking(id);
        bookingRepository.delete(booking);
    }

    @Transactional
    public Booking createBookingRequest(Booking booking) {
        Resource resource = requireBookableActiveResource(booking.getResourceId());
        booking.setResource(resource);

        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                resource.getResourceId(), booking.getStartTime(), booking.getEndTime(), activeStatuses);
        if (!overlapping.isEmpty()) {
            throw new IllegalStateException("Time slot conflicts with an existing booking.");
        }

        booking.setStatus(BookingStatus.PENDING);

        if (booking.getCreatedAt() == null) {
            booking.setCreatedAt(java.time.LocalDateTime.now());
        }

        if (booking.getContactEmail() == null)
            booking.setContactEmail("");
        if (booking.getDepartment() == null)
            booking.setDepartment("");
        if (booking.getSpecialReqs() == null)
            booking.setSpecialReqs("");

        Booking saved = bookingRepository.save(booking);
        // Seed the audit trail with the initial status
        logStatusChange(saved, BookingStatus.PENDING, String.valueOf(saved.getUserId()));
        return saved;
    }

    public Booking getBooking(Long id) {
        return bookingRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Booking not found."));
    }

    public List<Booking> getUserBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        backfillVerifyTokens(bookings);
        return bookings;
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        List<Booking> bookings = getUserBookings(userId);
        // getUserBookings already backfills; keep this for safety if behavior changes
        backfillVerifyTokens(bookings);
        return bookings;
    }

    public List<Booking> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        backfillVerifyTokens(bookings);
        return bookings;
    }

    public List<Booking> getAllBookingsByStatus(BookingStatus status) {
        List<Booking> bookings = bookingRepository.findByStatus(status);
        backfillVerifyTokens(bookings);
        return bookings;
    }

    @Transactional
    public Booking approveBooking(Long id, String changeBy) {
        Booking booking = getBooking(id);

        // Step 1: Validate booking is PENDING
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be approved.");
        }

        Resource resource = booking.getResource();
        if (resource == null || resource.getResourceId() == null) {
            throw new IllegalStateException("Booking has no associated resource.");
        }

        // Step 2: Check for time conflicts with other APPROVED bookings
        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                resource.getResourceId(), booking.getStartTime(), booking.getEndTime(), activeStatuses);
        boolean hasApprovedConflict = overlapping.stream()
                .anyMatch(b -> !b.getId().equals(booking.getId()) && b.getStatus() == BookingStatus.APPROVED);

        if (hasApprovedConflict) {
            booking.setStatus(BookingStatus.REJECTED);
            booking.setRejectionReason("Auto-rejected due to conflict with another approved booking");
            logStatusChange(booking, BookingStatus.REJECTED, changeBy);
            bookingRepository.save(booking);
            throw new IllegalStateException("Conflict detected with an already approved booking.");
        }

        // Step 3: Approve booking and UPDATE RESOURCE AVAILABILITY
        booking.setStatus(BookingStatus.APPROVED);
        booking.setVerifyToken(UUID.randomUUID().toString());
        logStatusChange(booking, BookingStatus.APPROVED, changeBy);

        // Step 4: Save both entities
        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public VerifyResponse verifyBooking(String token) {
        Booking booking = bookingRepository.findByVerifyToken(token)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            return new VerifyResponse(false, "Booking is not approved", null, null, null, null, null, 0);
        }

        LocalDate bookingDate = booking.getStartTime() != null ? booking.getStartTime().toLocalDate() : null;
        LocalDate today = LocalDate.now();

        if (bookingDate == null) {
            return new VerifyResponse(false, "Invalid booking time", null, null, null, null, null, 0);
        }

        if (!today.equals(bookingDate)) {
            return new VerifyResponse(
                    false,
                    "Wrong check-in date (Today: " + today + ", Booking: " + bookingDate + ")",
                    null, null, null, null, null, 0);
        }

        return new VerifyResponse(
                true,
                null,
                booking.getResourceId(),
                booking.getUserId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees());
    }

    @Transactional
    public Booking rejectBooking(Long id, String reason, String changedBy) {
        Booking booking = getBooking(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be rejected.");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        logStatusChange(booking, BookingStatus.REJECTED, changedBy);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking cancelBooking(Long id, Long userId) {
        Booking booking = getBooking(id);
        if (!booking.getUserId().equals(userId)) {
            throw new IllegalStateException("You can only cancel your own bookings.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalStateException("Booking is already inactive.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        logStatusChange(booking, BookingStatus.CANCELLED, String.valueOf(userId));
        return bookingRepository.save(booking);
    }

    @Transactional
    public List<BookingStatusHistory> getBookingHistory(Long bookingId) {
        List<BookingStatusHistory> history = bookingStatusHistoryRepository.findByBooking_IdOrderByChangedAtAsc(bookingId);
        if (!history.isEmpty()) {
            return history;
        }

        // Backfill a single "current status" entry for older bookings that were created
        // before audit logging was implemented.
        Booking booking = getBooking(bookingId);
        BookingStatusHistory seed = new BookingStatusHistory(
                booking,
                booking.getStatus(),
                booking.getCreatedAt() != null ? booking.getCreatedAt() : java.time.LocalDateTime.now(),
                String.valueOf(booking.getUserId()));
        bookingStatusHistoryRepository.save(seed);

        return bookingStatusHistoryRepository.findByBooking_IdOrderByChangedAtAsc(bookingId);
    }

    private void logStatusChange(Booking booking, BookingStatus status, String changedBy) {
        BookingStatusHistory history = new BookingStatusHistory(
                booking,
                status,
                java.time.LocalDateTime.now(),
                changedBy);
        bookingStatusHistoryRepository.save(history);
    }

    private void backfillVerifyTokens(List<Booking> bookings) {
        if (bookings == null || bookings.isEmpty()) return;

        boolean changed = false;
        for (Booking booking : bookings) {
            if (booking == null) continue;
            if (booking.getStatus() == BookingStatus.APPROVED) {
                String token = booking.getVerifyToken();
                if (token == null || token.isBlank()) {
                    booking.setVerifyToken(UUID.randomUUID().toString());
                    changed = true;
                }
            }
        }

        if (changed) {
            bookingRepository.saveAll(bookings);
        }
    }

    private Resource requireBookableActiveResource(Long resourceId) {
        if (resourceId == null) {
            throw new IllegalArgumentException("resourceId is required");
        }

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with id: " + resourceId));

        if (Boolean.FALSE.equals(resource.getIsBookable())) {
            throw new IllegalStateException("Selected resource is no longer available for booking");
        }

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalStateException(
                    "Resource is in " + resource.getStatus() + " status and cannot be booked");
        }

        return resource;
    }

    public boolean checkAvailability(Long resourceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);
        java.time.LocalDateTime startDateTime = java.time.LocalDateTime.of(date, startTime);
        java.time.LocalDateTime endDateTime = java.time.LocalDateTime.of(date, endTime);
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                resourceId, startDateTime, endDateTime, activeStatuses);
        return overlapping.isEmpty();
    }

    public List<Map<String, String>> getFreeSlots(Long resourceId, LocalDate date) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        LocalTime from = resource.getAvailableFrom();
        LocalTime to = resource.getAvailableTo();

        // Get approved bookings for the day
        java.time.LocalDateTime startOfDay = date.atStartOfDay();
        java.time.LocalDateTime endOfDay = date.atTime(23, 59, 59);
        List<BookingStatus> approvedStatus = Arrays.asList(BookingStatus.APPROVED);
        List<Booking> bookings = bookingRepository.findOverlappingBookings(
                resourceId, startOfDay, endOfDay, approvedStatus);

        // Sort by start time
        bookings.sort(java.util.Comparator.comparing(Booking::getStartTime));

        List<Map<String, String>> freeSlots = new java.util.ArrayList<>();
        LocalTime current = from;

        for (Booking b : bookings) {
            LocalTime bStart = b.getStartTime().toLocalTime();
            LocalTime bEnd = b.getEndTime().toLocalTime();

            // If there's a gap between current and booking start
            if (bStart.isAfter(current)) {
                freeSlots.add(Map.of("startTime", current.toString(), "endTime", bStart.toString()));
            }
            if (bEnd.isAfter(current)) {
                current = bEnd;
            }
        }

        // Final gap
        if (to.isAfter(current)) {
            freeSlots.add(Map.of("startTime", current.toString(), "endTime", to.toString()));
        }

        return freeSlots;
    }
}

