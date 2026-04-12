package com.code_wizards.Backend.service;

import java.util.Arrays;
import java.util.List;

import com.code_wizards.Backend.entity.Booking;
import com.code_wizards.Backend.entity.BookingStatus;
import com.code_wizards.Backend.repository.BookingRepository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

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
        return bookingRepository.save(booking);
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
    public Booking approveBooking(Long id) {
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
            bookingRepository.save(booking);
            throw new IllegalStateException("Conflict detected with an already approved booking.");
        }
        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking rejectBooking(Long id, String reason) {
        Booking booking = getBooking(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be rejected.");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
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
        return bookingRepository.save(booking);
    }
    
}
