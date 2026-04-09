package com.code_wizards.Backend.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long resourceId;   // which room/lab/equipment
    private Long userId;       // who made the booking

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private int expectedAttendees;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;  // PENDING, APPROVED, REJECTED, CANCELLED

    private String rejectionReason;

    private LocalDateTime createdAt;


    
}