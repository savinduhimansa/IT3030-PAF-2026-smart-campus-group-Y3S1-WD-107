package com.code_wizards.Backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.code_wizards.Backend.entity.Booking;
import com.code_wizards.Backend.entity.BookingStatus;
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>{

       List<Booking> findByUserId(Long userId);

       List<Booking> findByStatus(BookingStatus status);
    
       List<Booking> findByResourceIdAndStatus(Long resourceId, BookingStatus status);



    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.status IN :statuses " +
           "AND b.startTime < :newEndTime " +
           "AND b.endTime > :newStartTime")
    List<Booking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("newStartTime") java.time.LocalDateTime newStartTime,
            @Param("newEndTime") java.time.LocalDateTime newEndTime,
            @Param("statuses") java.util.List<BookingStatus> statuses);

}
