package com.gritblog.awsomeblog.controllers;

import com.gritblog.awsomeblog.DTO.AuthResponse;
import com.gritblog.awsomeblog.models.Category;
import com.gritblog.awsomeblog.service.CategoryService;
import com.gritblog.awsomeblog.service.ResourceNotFound;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {
    public  final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<Category> createCategory(String name){
        Category createdCat=categoryService.createCategory(name);
        return  ResponseEntity.status(HttpStatus.CREATED).body(createdCat);
    }

    @GetMapping
    public ResponseEntity<List<Category>> listCategory(){
         List<Category>cats=  categoryService.findAllCategories();
         return  ResponseEntity.ok(cats);
    }

    @DeleteMapping("{catId}")
    public ResponseEntity<AuthResponse>deleteCategory(@PathVariable Long catId){
         categoryService.deleteCategory(catId);
         return  ResponseEntity.ok(new AuthResponse("category deleted"));
    }
    @GetMapping("{catSlug}")
    public ResponseEntity<Category> fetchtcategory(@PathVariable String catSlug){
        Category cat=categoryService.getCategoryBySlug(catSlug).orElseThrow(()->new ResourceNotFound("no category with the id"));
        return  ResponseEntity.ok(cat);
    }

}
