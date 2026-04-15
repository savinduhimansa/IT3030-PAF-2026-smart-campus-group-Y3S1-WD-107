package com.code_wizards.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketCreateDto {
    @NotBlank(message = "Resource location is required")
    private String resourceLocation;

    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    @NotNull(message = "Category is required")
    private String category;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotNull(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Contact details are required")
    private String contactDetails;
}
