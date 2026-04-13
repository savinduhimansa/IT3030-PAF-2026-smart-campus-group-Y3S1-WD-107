package com.code_wizards.Backend.repository;

import com.code_wizards.Backend.entity.Feedback;
import com.code_wizards.Backend.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByResource(Resource resource);
}
