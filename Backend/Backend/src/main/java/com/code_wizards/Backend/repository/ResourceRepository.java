package com.code_wizards.Backend.repository;

import com.code_wizards.Backend.entity.Resource;
import com.code_wizards.Backend.entity.ResourceStatus;
import com.code_wizards.Backend.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    List<Resource> findByTypeAndCapacityGreaterThanEqualAndLocationContainingIgnoreCaseAndStatus(
            ResourceType type,
            Integer capacity,
            String location,
            ResourceStatus status
    );

    List<Resource> findByAvailableFromLessThanEqualAndAvailableToGreaterThanEqual(
            LocalTime availableFrom,
            LocalTime availableTo
    );
}