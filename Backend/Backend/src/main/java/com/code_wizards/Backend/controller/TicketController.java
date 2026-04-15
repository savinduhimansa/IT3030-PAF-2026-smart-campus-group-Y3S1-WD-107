package com.code_wizards.Backend.controller;

import com.code_wizards.Backend.dto.TicketCreateDto;
import com.code_wizards.Backend.dto.TicketUpdateDto;
import com.code_wizards.Backend.entity.Ticket;
import com.code_wizards.Backend.entity.TicketStatus;
import com.code_wizards.Backend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // A POST endpoint to create a new ticket.
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Ticket> createTicket(
            @Valid @RequestPart("ticket") TicketCreateDto ticketDto,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        
        Ticket ticket = Ticket.builder()
                .resourceId(ticketDto.getResourceId())
                .category(ticketDto.getCategory())
                .description(ticketDto.getDescription())
                .priority(ticketDto.getPriority())
                .resourceLocation(ticketDto.getResourceLocation())
                .contactDetails(ticketDto.getContactDetails())
                .build();
                
        Ticket createdTicket = ticketService.createTicket(ticket, files);
        return new ResponseEntity<>(createdTicket, HttpStatus.CREATED);
    }

    // A GET endpoint to retrieve tickets (with optional filtering by status).
    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(@RequestParam(required = false) TicketStatus status) {
        List<Ticket> tickets = ticketService.getTickets(status);
        return ResponseEntity.ok(tickets);
    }

    // A PATCH endpoint for technicians to update the ticket status and add resolution notes.
    @PatchMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketUpdateDto updateRequest) {
        
        Ticket updatedTicket = ticketService.updateTicketStatusAndResolution(
                id, 
                updateRequest.getStatus(), 
                updateRequest.getResolutionNotes()
        );
        return ResponseEntity.ok(updatedTicket);
    }

    // A DELETE endpoint to delete a specific comment, enforcing a check to ensure the user requesting the deletion is the owner of the comment.
    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestHeader("X-User-Id") Long requesterId) {
        
        ticketService.deleteComment(ticketId, commentId, requesterId);
        return ResponseEntity.noContent().build();
    }

    // A PUT endpoint to update a specific comment
    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<com.code_wizards.Backend.entity.Comment> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestHeader("X-User-Id") Long requesterId,
            @Valid @RequestBody com.code_wizards.Backend.dto.CommentUpdateDto updateDto) {
        
        com.code_wizards.Backend.entity.Comment updatedComment = ticketService.updateComment(ticketId, commentId, requesterId, updateDto.getText());
        return ResponseEntity.ok(updatedComment);
    }

}
