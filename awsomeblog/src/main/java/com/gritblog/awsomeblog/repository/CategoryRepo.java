package com.gritblog.awsomeblog.repository;

import com.gritblog.awsomeblog.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface CategoryRepo  extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    Optional<Category> findBySlug(String name);
}
