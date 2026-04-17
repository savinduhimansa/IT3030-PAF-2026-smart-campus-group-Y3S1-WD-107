package com.code_wizards.Backend.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

import com.code_wizards.Backend.entity.Booking;
import com.code_wizards.Backend.entity.BookingStatus;
import com.code_wizards.Backend.entity.BookingStatusHistory;
import com.code_wizards.Backend.repository.BookingRepository;
import com.code_wizards.Backend.repository.BookingHistoryRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingHistoryRepository bookingStatusHistoryRepository;



    @Transactional
    public Booking updateBooking(Long id, Booking updatedBooking) {
        Booking booking = getBooking(id);
        // Only allow update if booking is still pending
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be updated.");
        }
        // Update allowed fields
        booking.setResourceId(updatedBooking.getResourceId());
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
        java.util.List<BookingStatus> activeStatuses = java.util.Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);
        java.util.List<Booking> overlapping = bookingRepository.findOverlappingBookings(
            booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), activeStatuses);
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

    public java.util.List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public java.util.List<Booking> getAllBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    @Transactional
    public Booking approveBooking(Long id, String changeBy) {
        Booking booking = getBooking(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be approved.");
        }
        java.util.List<BookingStatus> activeStatuses = java.util.Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);
        java.util.List<Booking> overlapping = bookingRepository.findOverlappingBookings(
            booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), activeStatuses);
        boolean hasApprovedConflict = overlapping.stream()
                .anyMatch(b -> !b.getId().equals(booking.getId()) && b.getStatus() == BookingStatus.APPROVED);
        if (hasApprovedConflict) {
            booking.setStatus(BookingStatus.REJECTED);
            booking.setRejectionReason("Auto-rejected due to conflict with another approved booking");
            logStatusChange(booking, BookingStatus.REJECTED, changeBy);
            bookingRepository.save(booking);
            throw new IllegalStateException("Conflict detected with an already approved booking.");
        }
        booking.setStatus(BookingStatus.APPROVED);
        logStatusChange(booking, BookingStatus.APPROVED, changeBy);
        return bookingRepository.save(booking);
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

    public boolean checkAvailability(Long resourceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);
        java.time.LocalDateTime startDateTime = java.time.LocalDateTime.of(date, startTime);
        java.time.LocalDateTime endDateTime = java.time.LocalDateTime.of(date, endTime);
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                resourceId, startDateTime, endDateTime, activeStatuses);
        return overlapping.isEmpty();
    }
    
}
