package com.weblearning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, columnDefinition = "varchar(100)")
    private String name;

    @Column(unique = true, nullable = false, length = 120)
    private String slug;

    @Column(unique = true, columnDefinition = "varchar(255)")
    private String description;

    @Column(nullable = false)
    private boolean deleted;

    @Column
    private LocalDateTime deletedAt;
}
