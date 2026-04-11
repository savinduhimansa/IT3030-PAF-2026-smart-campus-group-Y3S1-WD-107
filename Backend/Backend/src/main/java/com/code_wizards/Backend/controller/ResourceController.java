package com.code_wizards.Backend.controller;

import com.code_wizards.Backend.dto.request.ResourceRequest;
import com.code_wizards.Backend.dto.response.ResourceResponse;
import com.code_wizards.Backend.entity.ResourceStatus;
import com.code_wizards.Backend.entity.ResourceType;
import com.code_wizards.Backend.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;


/**
 * Handles all resource APIs (CRUD, search, report)
 */
@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }
// Download all resources as PDF
    @GetMapping("/pdf")
    public ResponseEntity<byte[]> downloadResourcesPdf() {
        byte[] pdfBytes = resourceService.generateResourcesPdf();
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=resources.pdf")
                .header("Content-Type", "application/pdf")
                .body(pdfBytes);
    }

    // Create new resource
    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceRequest request) {
        ResourceResponse response = resourceService.createResource(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
 // Get all or filtered resources
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) LocalTime availableFrom,
            @RequestParam(required = false) LocalTime availableTo
    ) {
          // If filters exist → search
        if (type != null || minCapacity != null || location != null || status != null
                || availableFrom != null || availableTo != null) {
            return ResponseEntity.ok(
                    resourceService.searchResources(type, minCapacity, location, status, availableFrom, availableTo)
            );
        }
 // Otherwise return all
        return ResponseEntity.ok(resourceService.getAllResources());
    }
// Get resource by ID
    @GetMapping("/{resourceId}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long resourceId) {
        return ResponseEntity.ok(resourceService.getResourceById(resourceId));
    }
  // Update resource by ID
    @PutMapping("/{resourceId}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long resourceId,
            @Valid @RequestBody ResourceRequest request
    ) {
        return ResponseEntity.ok(resourceService.updateResource(resourceId, request));
    }
// Delete resource by ID
    @DeleteMapping("/{resourceId}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long resourceId) {
        resourceService.deleteResource(resourceId);
        return ResponseEntity.noContent().build();
    }
}