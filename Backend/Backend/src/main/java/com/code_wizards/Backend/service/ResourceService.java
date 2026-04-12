package com.code_wizards.Backend.service;

import com.code_wizards.Backend.dto.request.ResourceRequest;
import com.code_wizards.Backend.dto.response.ResourceResponse;
import com.code_wizards.Backend.entity.ResourceStatus;
import com.code_wizards.Backend.entity.ResourceType;

import java.time.LocalTime;
import java.util.List;

public interface ResourceService {

    ResourceResponse createResource(ResourceRequest request);

    List<ResourceResponse> getAllResources();

    ResourceResponse getResourceById(Long resourceId);

    ResourceResponse updateResource(Long resourceId, ResourceRequest request);

    void deleteResource(Long resourceId);
// Search resources with filters
    List<ResourceResponse> searchResources(
            ResourceType type,
            Integer minCapacity,
            String location,
            ResourceStatus status,
            LocalTime availableFrom,
            LocalTime availableTo
    );
    // Generate PDF report
    byte[] generateResourcesPdf();
}