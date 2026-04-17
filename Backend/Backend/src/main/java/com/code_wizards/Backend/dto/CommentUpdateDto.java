package com.code_wizards.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentUpdateDto {
    @NotBlank(message = "Comment text cannot be blank")
    private String text;
}
