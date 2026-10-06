package com.graph.job.recommendation.service;

import com.graph.job.recommendation.dto.LocationResponse;
import com.graph.job.recommendation.mapper.ApiMapper;
import com.graph.job.recommendation.repository.LocationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public List<LocationResponse> findAll() {
        return locationRepository.findAll().stream()
                .map(ApiMapper::toLocationResponse)
                .toList();
    }
}
