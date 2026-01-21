package com.swam.booking.service;

import com.swam.booking.domain.ExtraOption;
import com.swam.booking.dto.CreateExtraOptionRequest;
import com.swam.booking.dto.ExtraOptionResponse;
import com.swam.booking.repository.ExtraOptionRepository;
import com.swam.shared.enums.ExtraCategory;
import com.swam.shared.exceptions.ExtraOptionNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExtraOptionServiceTest {

    @Mock
    private ExtraOptionRepository extraOptionRepository;

    @InjectMocks
    private ExtraOptionService extraOptionService;

    @Test
    @DisplayName("GetAllActive: Should return only active extra options")
    void getAllActiveExtraOptions_ShouldReturnList() {
        ExtraOption extra1 = ExtraOption.builder().id("1").name("Breakfast").isActive(true).build();
        ExtraOption extra2 = ExtraOption.builder().id("2").name("Parking").isActive(true).build();

        when(extraOptionRepository.findByIsActiveTrue()).thenReturn(Arrays.asList(extra1, extra2));

        List<ExtraOptionResponse> result = extraOptionService.getAllActiveExtraOptions();

        assertEquals(2, result.size());
        assertEquals("Breakfast", result.get(0).getName());
        verify(extraOptionRepository).findByIsActiveTrue();
    }

    @Test
    @DisplayName("GetAll: Should return all extra options including inactive")
    void getAllExtraOptions_ShouldReturnAll() {
        ExtraOption extra1 = ExtraOption.builder().id("1").isActive(true).build();
        ExtraOption extra2 = ExtraOption.builder().id("2").isActive(false).build();

        when(extraOptionRepository.findAll()).thenReturn(Arrays.asList(extra1, extra2));

        List<ExtraOptionResponse> result = extraOptionService.getAllExtraOptions();

        assertEquals(2, result.size());
        verify(extraOptionRepository).findAll();
    }

    @Test
    @DisplayName("GetById: Should return extra option when found")
    void getExtraById_ShouldReturnResponse_WhenExists() {
        String id = "opt-1";
        ExtraOption extra = ExtraOption.builder()
                .id(id)
                .name("Spa")
                .defaultPrice(BigDecimal.TEN)
                .build();

        when(extraOptionRepository.findById(id)).thenReturn(Optional.of(extra));

        ExtraOptionResponse response = extraOptionService.getExtraById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("Spa", response.getName());
    }

    @Test
    @DisplayName("GetById: Should throw exception when not found")
    void getExtraById_ShouldThrow_WhenNotFound() {
        String id = "opt-missing";
        when(extraOptionRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ExtraOptionNotFoundException.class, () -> extraOptionService.getExtraById(id));
    }

    @Test
    @DisplayName("Create: Should save and return new extra option")
    void createExtra_ShouldCreate() {
        CreateExtraOptionRequest request = CreateExtraOptionRequest.builder()
                .name("Lunch")
                .description("Full lunch")
                .defaultPrice(new BigDecimal("25.00"))
                .category(ExtraCategory.FOOD_BEVERAGE)
                .isActive(true)
                .build();

        when(extraOptionRepository.save(any(ExtraOption.class))).thenAnswer(invocation -> {
            ExtraOption saved = invocation.getArgument(0);
            saved.setId("new-id-123");
            return saved;
        });

        ExtraOptionResponse response = extraOptionService.createExtra(request);

        assertNotNull(response.getId());
        assertEquals(request.getName(), response.getName());
        assertEquals(request.getDefaultPrice(), response.getDefaultPrice());
        assertEquals(request.getCategory(), response.getCategory());
        assertTrue(response.isActive());

        verify(extraOptionRepository).save(any(ExtraOption.class));
    }

    @Test
    @DisplayName("Update: Should update existing extra option")
    void updateExtra_ShouldUpdate_WhenExists() {
        String id = "opt-1";
        CreateExtraOptionRequest request = CreateExtraOptionRequest.builder()
                .name("Lunch Updated")
                .defaultPrice(new BigDecimal("30.00"))
                .category(ExtraCategory.FOOD_BEVERAGE)
                .isActive(false)
                .build();

        ExtraOption existing = ExtraOption.builder()
                .id(id)
                .name("Lunch")
                .defaultPrice(new BigDecimal("25.00"))
                .isActive(true)
                .build();

        when(extraOptionRepository.findById(id)).thenReturn(Optional.of(existing));
        when(extraOptionRepository.save(any(ExtraOption.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExtraOptionResponse response = extraOptionService.updateExtra(id, request);

        assertEquals("Lunch Updated", response.getName());
        assertEquals(new BigDecimal("30.00"), response.getDefaultPrice());
        assertFalse(response.isActive());
        verify(extraOptionRepository).save(existing);
    }

    @Test
    @DisplayName("Update: Should throw exception when not found")
    void updateExtra_ShouldThrow_WhenNotFound() {
        String id = "opt-missing";
        CreateExtraOptionRequest request = new CreateExtraOptionRequest();
        when(extraOptionRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ExtraOptionNotFoundException.class, () -> extraOptionService.updateExtra(id, request));
        verify(extraOptionRepository, never()).save(any());
    }

    @Test
    @DisplayName("GetEntity: Should return raw entity (used by BookingService)")
    void getExtraEntity_ShouldReturnEntity() {
        String id = "opt-1";
        ExtraOption extra = ExtraOption.builder().id(id).build();
        when(extraOptionRepository.findById(id)).thenReturn(Optional.of(extra));

        ExtraOption result = extraOptionService.getExtraEntity(id);

        assertEquals(extra, result);
    }
}