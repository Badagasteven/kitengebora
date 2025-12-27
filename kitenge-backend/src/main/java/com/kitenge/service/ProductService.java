package com.kitenge.service;

import com.kitenge.model.Product;
import com.kitenge.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    
    public List<Product> getAllPublicProducts() {
        return productRepository.findByActiveTrueOrderByIdDesc();
    }
    
    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByInStockDescActiveDescIdDesc();
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
    
    @Transactional
    public Product createProduct(Product product) {
        if (product.getActive() == null) {
            product.setActive(true);
        }
        if (product.getInStock() == null) {
            product.setInStock(true);
        }
        return productRepository.save(product);
    }
    
    @Transactional
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        
        if (productDetails.getName() != null) {
            product.setName(productDetails.getName());
        }
        if (productDetails.getDescription() != null) {
            product.setDescription(productDetails.getDescription());
        }
        if (productDetails.getCategory() != null) {
            product.setCategory(productDetails.getCategory());
        }
        if (productDetails.getPrice() != null) {
            product.setPrice(productDetails.getPrice());
        }
        if (productDetails.getImage() != null) {
            product.setImage(productDetails.getImage());
        }
        if (productDetails.getInStock() != null) {
            product.setInStock(productDetails.getInStock());
        }
        if (productDetails.getIsPromo() != null) {
            product.setIsPromo(productDetails.getIsPromo());
        }
        if (productDetails.getOriginalPrice() != null) {
            product.setOriginalPrice(productDetails.getOriginalPrice());
        }
        if (productDetails.getDiscount() != null) {
            product.setDiscount(productDetails.getDiscount());
        }
        if (productDetails.getActive() != null) {
            product.setActive(productDetails.getActive());
        }
        
        return productRepository.save(product);
    }
    
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}

