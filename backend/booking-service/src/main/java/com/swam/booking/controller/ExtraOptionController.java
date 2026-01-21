package com.swam.booking.controller;

import com.swam.booking.dto.CreateExtraOptionRequest;
import com.swam.booking.dto.ExtraOptionResponse;
import com.swam.booking.service.ExtraOptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/extras")
@RequiredArgsConstructor
public class ExtraOptionController {

    private final ExtraOptionService extraOptionService;

    // If includeInactive is true, fetch all extras (also inactives), else fetch only active extras
    @GetMapping
    public ResponseEntity<List<ExtraOptionResponse>> getExtras(
            @RequestParam(required = false, defaultValue = "true") boolean includeInactive) {

        if (includeInactive) {
            return ResponseEntity.ok(extraOptionService.getAllExtraOptions());
        } else {
            return ResponseEntity.ok(extraOptionService.getAllActiveExtraOptions());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExtraOptionResponse> getExtraById(@PathVariable String id) {
        return ResponseEntity.ok(extraOptionService.getExtraById(id));
    }

    @PostMapping
    public ResponseEntity<ExtraOptionResponse> createExtra(@Valid @RequestBody CreateExtraOptionRequest request) {
        ExtraOptionResponse created = extraOptionService.createExtra(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExtraOptionResponse> updateExtra(
            @PathVariable String id,
            @Valid @RequestBody CreateExtraOptionRequest request) {
        return ResponseEntity.ok(extraOptionService.updateExtra(id, request));
    }
}