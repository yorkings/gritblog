package com.gritblog.awsomeblog.service;

import com.gritblog.awsomeblog.models.Category;
import com.gritblog.awsomeblog.repository.CategoryRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private  final CategoryRepo categoryRepo;

    @Transactional
    public Category createCategory(String name) {
        String slug = name.toLowerCase().replaceAll("[^a-z0-9\\s-]", "").replaceAll(" ", "-");

        if (categoryRepo.findByName(name).isPresent() || categoryRepo.findBySlug(slug).isPresent()) {
            throw new IllegalArgumentException("Category name or slug already exists.");
        }

        Category category = Category.builder().name(name).slug(slug).build();
        return categoryRepo.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));
        categoryRepo.delete(category);
    }
    @Transactional
    public List<Category> findAllCategories() {
        return categoryRepo.findAll();
    }
    @Transactional
    public Optional<Category> getCategoryBySlug(String slug) {
        return categoryRepo.findBySlug(slug);
    }
}
