package com.code_wizards.Backend.dto;

import com.code_wizards.Backend.entity.TicketStatus;
import lombok.Data;

@Data
public class TicketUpdateDto {
    private TicketStatus status;
    private String resolutionNotes;
}
