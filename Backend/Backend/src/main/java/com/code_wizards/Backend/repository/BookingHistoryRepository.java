package com.code_wizards.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.code_wizards.Backend.entity.BookingStatusHistory;
import java.util.List;

public interface BookingHistoryRepository extends JpaRepository<BookingStatusHistory, Long> {

    List<BookingStatusHistory> findByBooking_IdOrderByChangedAtAsc(Long bookingId);
}
