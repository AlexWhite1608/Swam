package com.swam.booking.service;

import com.swam.booking.domain.ExtraOption;
import com.swam.booking.dto.CreateExtraOptionRequest;
import com.swam.booking.dto.ExtraOptionResponse;
import com.swam.booking.repository.ExtraOptionRepository;
import com.swam.shared.exceptions.ExtraOptionNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExtraOptionService {

    private final ExtraOptionRepository extraOptionRepository;

    public List<ExtraOptionResponse> getAllActiveExtraOptions() {
        return extraOptionRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // fetch all extra options, including inactive ones
    public List<ExtraOptionResponse> getAllExtraOptions() {
        return extraOptionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ExtraOptionResponse getExtraById(String id) {
        ExtraOption extra = getExtraEntityOrThrow(id);
        return mapToResponse(extra);
    }

    // uses by BookingService to create the snapshot of the extra option
    public ExtraOption getExtraEntity(String id) {
        return getExtraEntityOrThrow(id);
    }

    @Transactional
    public ExtraOptionResponse createExtra(CreateExtraOptionRequest request) {

        ExtraOption extra = ExtraOption.builder()
                .name(request.getName())
                .description(request.getDescription())
                .defaultPrice(request.getDefaultPrice())
                .category(request.getCategory())
                .isActive(request.isActive())
                .build();

        ExtraOption saved = extraOptionRepository.save(extra);
        return mapToResponse(saved);
    }

    @Transactional
    public ExtraOptionResponse updateExtra(String id, CreateExtraOptionRequest request) {

        ExtraOption extra = getExtraEntityOrThrow(id);

        extra.setName(request.getName());
        extra.setDescription(request.getDescription());
        extra.setDefaultPrice(request.getDefaultPrice());
        extra.setCategory(request.getCategory());
        extra.setActive(request.isActive());

        ExtraOption updated = extraOptionRepository.save(extra);
        return mapToResponse(updated);
    }

    private ExtraOption getExtraEntityOrThrow(String id) {
        return extraOptionRepository.findById(id)
                .orElseThrow(() -> new ExtraOptionNotFoundException(id));
    }

    // mapping entity to response DTO
    private ExtraOptionResponse mapToResponse(ExtraOption extra) {
        return ExtraOptionResponse.builder()
                .id(extra.getId())
                .name(extra.getName())
                .description(extra.getDescription())
                .defaultPrice(extra.getDefaultPrice())
                .category(extra.getCategory())
                .isActive(extra.isActive())
                .build();
    }
}