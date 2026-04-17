package com.code_wizards.Backend.service;

import com.code_wizards.Backend.entity.Ticket;
import com.code_wizards.Backend.entity.TicketStatus;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface TicketService {
    Ticket createTicket(Ticket ticket, MultipartFile[] files);
    List<Ticket> getTickets(TicketStatus status, Long creatorId, boolean isAdmin);
    com.code_wizards.Backend.entity.Comment addComment(Long ticketId, Long authorId, String text);
    Ticket updateTicketStatusAndResolution(Long id, TicketStatus status, String resolutionNotes);
    void deleteComment(Long ticketId, Long commentId, Long requesterId);
    com.code_wizards.Backend.entity.Comment updateComment(Long ticketId, Long commentId, Long requesterId, String newText);
}
