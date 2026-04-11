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

import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import java.io.ByteArrayOutputStream;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public byte[] generateResourcesPdf() {
        List<Resource> resources = resourceRepository.findAll();
        // Create PDF in memory
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        // Add content to PDF
        document.add(new Paragraph("Resource List"));
        // Add each resource to PDF
        for (Resource resource : resources) {
            document.add(new Paragraph(
                "ID: " + resource.getResourceId() + ", Name: " + resource.getName() + ", Type: " + resource.getType() +
                ", Capacity: " + resource.getCapacity() + ", Location: " + resource.getLocation() +
                ", Status: " + resource.getStatus()
            ));
        }
        document.close();
        // Return PDF as byte array
        return baos.toByteArray();
    }

    @Override
    public ResourceResponse createResource(ResourceRequest request) {
        // Validate availability time
        validateAvailabilityWindow(request.getAvailableFrom(), request.getAvailableTo());

        Resource resource = new Resource();
        // Convert request → entity
        mapRequestToEntity(request, resource);

        Resource savedResource = resourceRepository.save(resource);
        // Save to DB
        return mapEntityToResponse(savedResource);
        // Return response DTO
    }

    @Override
    public List<ResourceResponse> getAllResources() {
        // Fetch all resources
        return resourceRepository.findAll()
                .stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponse getResourceById(Long resourceId) {
        // Find resource or throw error
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));
// Convert to response
        return mapEntityToResponse(resource);
    }
//update resource
    @Override
    public ResourceResponse updateResource(Long resourceId, ResourceRequest request) {
        validateAvailabilityWindow(request.getAvailableFrom(), request.getAvailableTo());

        Resource existingResource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        mapRequestToEntity(request, existingResource);

        Resource updatedResource = resourceRepository.save(existingResource);
        return mapEntityToResponse(updatedResource);
    }

    //Delete resource
    @Override
    public void deleteResource(Long resourceId) {
        Resource existingResource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        resourceRepository.delete(existingResource);
    }

    //search resources with filters
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
//Validation method
    private void validateAvailabilityWindow(LocalTime from, LocalTime to) {
        if (from != null && to != null && !from.isBefore(to)) {
            throw new IllegalArgumentException("availableFrom must be earlier than availableTo");
        }
    }
//Mapping methods
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