'use client';

import React, { useState, useEffect, useCallback } from 'react';

function SearchAndFilter({
  searchTerm,
  setSearchTerm,
  boothFilter,
  setBoothFilter,
  ageFilter,
  setAgeFilter,
  genderFilter,
  setGenderFilter,
  booths
}) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, setSearchTerm]);

  // Update local state when external searchTerm changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleClearFilters = useCallback(() => {
    setLocalSearchTerm('');
    setSearchTerm('');
    setBoothFilter('all');
    setAgeFilter('all');
    setGenderFilter('all');
  }, [setSearchTerm, setBoothFilter, setAgeFilter, setGenderFilter]);
  return (
    <div className="search-filter-container">
      <div className="search-input-group">
        <div className="search-input">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or Voter ID..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-item">
          <label className="form-label">Booth</label>
          <select
            className="form-control filter-select"
            value={boothFilter}
            onChange={(e) => setBoothFilter(e.target.value)}
          >
            <option value="all">All Booths</option>
            {booths.map(booth => (
              <option key={booth} value={booth}>{booth}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label className="form-label">Age</label>
          <select
            className="form-control filter-select"
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
          >
            <option value="all">All Ages</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-50">36-50</option>
            <option value="51-65">51-65</option>
            <option value="65+">65+</option>
          </select>
        </div>

        <div className="filter-item">
          <label className="form-label">Gender</label>
          <select
            className="form-control filter-select"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="filter-actions">
          <button
            className="btn btn-secondary"
            onClick={handleClearFilters}
          >
            <i className="fas fa-times"></i> Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchAndFilter;
