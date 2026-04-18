package com.code_wizards.Backend.dto.response;

import com.code_wizards.Backend.entity.ResourceStatus;
import com.code_wizards.Backend.entity.ResourceType;

import java.time.LocalTime;

//DTO for sending resource data to client
public class ResourceResponse {

    private Long resourceId;
    private String name;
    private ResourceType type;
    private String department;
    private Integer capacity;
    private String location;
    private String description;
    private String brand;
    private String model;
    private String serialNumber;
    private ResourceStatus status;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private Boolean isBookable;

    public ResourceResponse() {
    }

    // Constructor to set all fields
    public ResourceResponse(Long resourceId, String name, ResourceType type, String department, Integer capacity, String location,
            String description, String brand, String model, String serialNumber, ResourceStatus status, LocalTime availableFrom,
            LocalTime availableTo, Boolean isBookable) {
        this.resourceId = resourceId;
        this.name = name;
        this.type = type;
        this.department = department;
        this.capacity = capacity;
        this.location = location;
        this.description = description;
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.status = status;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.isBookable = isBookable;
    }

    // Getters and setters
    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public LocalTime getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public LocalTime getAvailableTo() {
        return availableTo;
    }

    public void setAvailableTo(LocalTime availableTo) {
        this.availableTo = availableTo;
    }

    public Boolean getIsBookable() {
        return isBookable;
    }

    public void setIsBookable(Boolean isBookable) {
        this.isBookable = isBookable;
    }
}