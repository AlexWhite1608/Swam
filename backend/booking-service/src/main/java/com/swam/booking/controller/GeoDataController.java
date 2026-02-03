package com.swam.booking.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.swam.shared.dto.ItalianCity;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/api/geo")
@RequiredArgsConstructor
public class GeoDataController {

    private final ObjectMapper objectMapper;
    private List<ItalianCity> cachedCities;

    @Value("${app.geo.dataset-path}")
    private String datasetPath;

    @PostConstruct
    public void init() {
        try {
            log.info("Loading Geo Data from: {}", datasetPath);

            // 2. Usiamo la variabile iniettata
            ClassPathResource resource = new ClassPathResource(datasetPath);

            if (resource.exists()) {
                this.cachedCities = objectMapper.readValue(
                        resource.getInputStream(),
                        new TypeReference<>() {
                        }
                );
                log.info("Loaded {} cities into memory.", cachedCities.size());
            } else {
                log.error("Geo dataset not found at classpath: {}", datasetPath);
            }
        } catch (IOException e) {
            log.error("Failed to load geo dataset", e);
        }
    }

    @GetMapping("/italian-cities")
    public ResponseEntity<List<ItalianCity>> getItalianCities() {
        if (cachedCities == null || cachedCities.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                .body(cachedCities);
    }
}