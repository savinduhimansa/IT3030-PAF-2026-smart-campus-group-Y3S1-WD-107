package com.code_wizards.Backend.service.impl;

import com.code_wizards.Backend.dto.request.ResourceRequest;
import com.code_wizards.Backend.dto.response.ResourceResponse;
import com.code_wizards.Backend.entity.Resource;
import com.code_wizards.Backend.entity.ResourceStatus;
import com.code_wizards.Backend.entity.ResourceType;
import com.code_wizards.Backend.exception.ResourceNotFoundException;
import com.code_wizards.Backend.repository.ResourceRepository;
import com.code_wizards.Backend.service.ResourceService;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public ResourceResponse createResource(ResourceRequest request) {
        validateAvailabilityWindow(request.getAvailableFrom(), request.getAvailableTo());

        Resource resource = new Resource();
        mapRequestToEntity(request, resource);

        Resource savedResource = resourceRepository.save(resource);
        return mapEntityToResponse(savedResource);
    }

    @Override
    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponse getResourceById(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        return mapEntityToResponse(resource);
    }

    @Override
    public ResourceResponse updateResource(Long resourceId, ResourceRequest request) {
        validateAvailabilityWindow(request.getAvailableFrom(), request.getAvailableTo());

        Resource existingResource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        mapRequestToEntity(request, existingResource);

        Resource updatedResource = resourceRepository.save(existingResource);
        return mapEntityToResponse(updatedResource);
    }

    @Override
    public void deleteResource(Long resourceId) {
        Resource existingResource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        resourceRepository.delete(existingResource);
    }

    @Override
    public List<ResourceResponse> searchResources(ResourceType type, Integer minCapacity, String location,
                                                  ResourceStatus status, LocalTime availableFrom, LocalTime availableTo) {

        List<Resource> resources = resourceRepository.findAll();

        return resources.stream()
                .filter(resource -> type == null || resource.getType() == type)
                .filter(resource -> minCapacity == null || resource.getCapacity() >= minCapacity)
                .filter(resource -> location == null || location.isBlank() ||
                        resource.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(resource -> status == null || resource.getStatus() == status)
                .filter(resource -> availableFrom == null || !resource.getAvailableFrom().isAfter(availableFrom))
                .filter(resource -> availableTo == null || !resource.getAvailableTo().isBefore(availableTo))
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    private void validateAvailabilityWindow(LocalTime from, LocalTime to) {
        if (from != null && to != null && !from.isBefore(to)) {
            throw new IllegalArgumentException("availableFrom must be earlier than availableTo");
        }
    }

    private void mapRequestToEntity(ResourceRequest request, Resource resource) {
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setStatus(request.getStatus());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setIsBookable(request.getIsBookable());
    }

    private ResourceResponse mapEntityToResponse(Resource resource) {
        return new ResourceResponse(
                resource.getResourceId(),
                resource.getName(),
                resource.getType(),
                resource.getCapacity(),
                resource.getLocation(),
                resource.getDescription(),
                resource.getStatus(),
                resource.getAvailableFrom(),
                resource.getAvailableTo(),
                resource.getIsBookable()
        );
    }
}