package com.code_wizards.Backend.service.impl;

import com.code_wizards.Backend.entity.Attachment;
import com.code_wizards.Backend.entity.Comment;
import com.code_wizards.Backend.entity.Ticket;
import com.code_wizards.Backend.entity.TicketStatus;
import com.code_wizards.Backend.repository.CommentRepository;
import com.code_wizards.Backend.repository.TicketRepository;
import com.code_wizards.Backend.service.FileStorageService;
import com.code_wizards.Backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import com.code_wizards.Backend.exception.TicketNotFoundException;
import com.code_wizards.Backend.exception.UnauthorizedCommentEditException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public Ticket createTicket(Ticket ticket, MultipartFile[] files) {
        if (files != null && files.length > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot upload more than 3 files per ticket.");
        }

        if (ticket.getStatus() == null) {
            ticket.setStatus(TicketStatus.OPEN);
        }

        List<String> filePaths = fileStorageService.saveFiles(files != null ? files : new MultipartFile[0]);
        for (String filePath : filePaths) {
            Attachment attachment = Attachment.builder()
                    .fileName(filePath.substring(filePath.lastIndexOf("/") + 1))
                    .fileUrl(filePath)
                    .ticket(ticket)
                    .build();
            ticket.getAttachments().add(attachment);
        }

        return ticketRepository.save(ticket);
    }

    @Override
    public List<Ticket> getTickets(TicketStatus status, Long creatorId, boolean isAdmin) {
        if (isAdmin) {
            if (status != null) {
                return ticketRepository.findByStatus(status);
            }
            return ticketRepository.findAll();
        } else {
            if (status != null) {
                return ticketRepository.findByStatusAndCreatorId(status, creatorId);
            }
            return ticketRepository.findByCreatorId(creatorId);
        }
    }

    @Override
    @Transactional
    public Comment addComment(Long ticketId, Long authorId, String text) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        // SLA: Capture time-to-first-response on the FIRST comment ever posted
        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(LocalDateTime.now());
            ticketRepository.save(ticket);
        }

        Comment comment = Comment.builder()
                .ticket(ticket)
                .authorId(authorId)
                .text(text)
                .build();

        return commentRepository.save(comment);
    }

    @Override
    @Transactional
    public Ticket updateTicketStatusAndResolution(Long id, TicketStatus status, String resolutionNotes) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        if (status != null) {
            ticket.setStatus(status);

            // SLA: Capture time-to-resolution when status changes to RESOLVED
            if (status == TicketStatus.RESOLVED && ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(LocalDateTime.now());
            }

            // SLA: Clear resolvedAt if ticket is reopened (status changed back from RESOLVED)
            if (status != TicketStatus.RESOLVED && status != TicketStatus.CLOSED) {
                ticket.setResolvedAt(null);
            }
        }
        if (resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }
        
        return ticketRepository.save(ticket);
    }

    @Override
    @Transactional
    public void deleteComment(Long ticketId, Long commentId, Long requesterId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found with id: " + commentId));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to the specified ticket.");
        }

        if (!comment.getAuthorId().equals(requesterId)) {
            throw new UnauthorizedCommentEditException("User does not have permission to delete this comment.");
        }

        commentRepository.delete(comment);
    }

    @Override
    @Transactional
    public Comment updateComment(Long ticketId, Long commentId, Long requesterId, String newText) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found with id: " + commentId));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to the specified ticket.");
        }

        if (!comment.getAuthorId().equals(requesterId)) {
            throw new UnauthorizedCommentEditException("User does not have permission to edit this comment.");
        }

        comment.setText(newText);
        return commentRepository.save(comment);
    }
}
