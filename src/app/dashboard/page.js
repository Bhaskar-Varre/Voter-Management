'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import VoterTable from '@/app/dashboard/components/VoterTable';
import SearchAndFilter from '@/app/dashboard/components/SearchAndFilter';
import Analytics from '@/app/dashboard/components/Analytics';
import VoterModal from '@/app/dashboard/components/VoterModal';
import LoadingSpinner from '@/app/dashboard/components/LoadingSpinner';
import './Dashboard.css';

function Dashboard() {
  const { user, logout, isAdmin, isVolunteer } = useAuth();
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [boothFilter, setBoothFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingVoter, setEditingVoter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  
  // Cache for loaded pages
  const [voterCache, setVoterCache] = useState(new Map());
  const [allBooths, setAllBooths] = useState([]);

  // Optimized data loading with pagination, caching, and server-side filtering
  const loadVotersPage = useCallback(async (page = 0, size = 100, filters = {}, useCache = true) => {
    const { search, booth, gender, ageRange } = filters;
    let minAge, maxAge;
    
    if (ageRange && ageRange !== 'all') {
      if (ageRange.includes('-')) {
        [minAge, maxAge] = ageRange.split('-').map(Number);
      } else if (ageRange.includes('+')) {
        minAge = parseInt(ageRange);
        maxAge = null;
      }
    }
    
    const cacheKey = `${page}-${size}-${search || ''}-${booth || ''}-${gender || ''}-${ageRange || ''}`;
    
    // Check cache first
    if (useCache && voterCache.has(cacheKey)) {
      const cachedData = voterCache.get(cacheKey);
      setVoters(cachedData.voters);
      setCurrentPage(cachedData.currentPage);
      setTotalPages(cachedData.totalPages);
      setTotalItems(cachedData.totalItems);
      return cachedData;
    }

    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      if (search && search.trim()) params.append('search', search.trim());
      if (booth && booth !== 'all') params.append('booth', booth);
      if (gender && gender !== 'all') params.append('gender', gender);
      if (minAge) params.append('minAge', minAge.toString());
      if (maxAge) params.append('maxAge', maxAge.toString());
      
      const resp = await fetch(`/api/voters?${params}`);
      if (!resp.ok) throw new Error(`Fetch failed: ${resp.statusText}`);
      
      const data = await resp.json();
      if (!data.voters || !Array.isArray(data.voters)) {
        throw new Error('Invalid data format');
      }

      const pageData = {
        voters: data.voters,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalItems: data.totalItems
      };

      // Cache the result
      setVoterCache(prev => new Map(prev.set(cacheKey, pageData)));
      
      setVoters(data.voters);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      
      setSuccess(`Loaded ${data.voters.length} voters (Page ${data.currentPage + 1} of ${data.totalPages})`);
      setTimeout(() => setSuccess(''), 3000);
      
      return pageData;
    } catch (err) {
      console.error('Load error', err);
      setError('Failed to load voters from backend');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [voterCache]); // Removed pageSize
   // Remove voterCache dependency to prevent infinite loop

  // Load booths from backend
  const loadBooths = useCallback(async () => {
    try {
      const resp = await fetch('/api/voters/booths');
      if (resp.ok) {
        const booths = await resp.json();
        setAllBooths(booths);
      }
    } catch (err) {
      console.error('Failed to load booths', err);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadVotersPage(0, pageSize);
    loadBooths();
  }, [loadVotersPage, loadBooths, pageSize]); // Added loadVotersPage, loadBooths, and pageSize

  // Server-side filtering - reload data when filters change
  useEffect(() => {
    const filters = {
      search: searchTerm,
      booth: boothFilter,
      gender: genderFilter,
      ageRange: ageFilter
    };
    
    loadVotersPage(0, pageSize, filters);
    setCurrentPage(0); // Reset to first page when filters change
  }, [searchTerm, boothFilter, ageFilter, genderFilter, pageSize, loadVotersPage]); // Added loadVotersPage

  // Since we're using server-side filtering, filteredVoters is just voters
  useEffect(() => {
    setFilteredVoters(voters);
  }, [voters]);

  // Add / Update / Delete with backend

  const handleAddVoter = () => {
    setEditingVoter(null);
    setShowModal(true);
  };

  const handleEditVoter = (voter) => {
    setEditingVoter(voter);
    setShowModal(true);
  };

  const handleDeleteVoter = async (voterId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const resp = await fetch(`/api/voters/${voterId}`, {
        method: 'DELETE'
      });
      if (!resp.ok) {
        throw new Error(`Delete failed: ${resp.statusText}`);
      }

      // Optionally, you might get back the deleted object or ID; here, just update state
      setVoters(prev => prev.filter(v => v.id !== voterId));
      setSuccess('Voter record deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete error', err);
      setError('Failed to delete voter from backend');
    }
  };

  const handleSaveVoter = async (voterData) => {
    // voterData is an object with the fields to save (firstName, lastName, etc.)
    try {
      if (editingVoter) {
        // Update existing
        const resp = await fetch(`/api/voters/${editingVoter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(voterData)
        });
        if (!resp.ok) {
          throw new Error(`Update failed: ${resp.statusText}`);
        }
        const updated = await resp.json();
        setVoters(prev =>
          prev.map(v => (v.id === editingVoter.id ? updated : v))
        );
        setSuccess('Voter record updated successfully');
      } else {
        // Create new
        const resp = await fetch('/api/voters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([voterData]) // if backend expects array
        });
        
        if (!resp.ok) {
          throw new Error(`Save failed: ${resp.statusText}`);
        }
        const created = await resp.json(); // this is now an array
        setVoters(prev => [...prev, ...created]); // spread the new voters into the list

        setSuccess('New voter record added successfully');
      }
    } catch (err) {
      console.error('Save error', err);
      setError('Failed to save voter');
    }

    setShowModal(false);
    setEditingVoter(null);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Removed handleImportData function

  // Use backend-loaded booths instead of calculating from current page
  const uniqueBooths = useMemo(() => {
    return allBooths.length > 0 ? allBooths : [...new Set(voters.map(v => v.booth).filter(Boolean))].sort();
  }, [allBooths, voters]);

  const stats = useMemo(() => ({
    total: totalItems, // Use total from backend instead of current page
    filtered: filteredVoters.length,
    currentPage: voters.length,
    male: voters.filter(v => v.gender === 'Male').length,
    female: voters.filter(v => v.gender === 'Female').length,
    booths: allBooths.length // Use allBooths.length for total booths
  }), [totalItems, filteredVoters.length, voters, allBooths.length]);

  // Pagination handlers
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      const filters = {
        search: searchTerm,
        booth: boothFilter,
        gender: genderFilter,
        ageRange: ageFilter
      };
      loadVotersPage(newPage, pageSize, filters);
    }
  }, [pageSize, totalPages, searchTerm, boothFilter, genderFilter, ageFilter, loadVotersPage]); // Added loadVotersPage

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
    setVoterCache(new Map()); // Clear cache when page size changes
  }, []);

  if (!user) {
    return <LoadingSpinner size="small" message="Please log in to access the dashboard." />;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Voter Management System</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <span className={`role-badge role-${user.role}`}>
              {user.role.toUpperCase()}
            </span>
            <button onClick={logout} className="btn btn-secondary">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        
        
        <div className="dashboard-controls">
          <SearchAndFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            boothFilter={boothFilter}
            setBoothFilter={setBoothFilter}
            ageFilter={ageFilter}
            setAgeFilter={setAgeFilter}
            genderFilter={genderFilter}
            setGenderFilter={setGenderFilter}
            booths={uniqueBooths}
          />

          <div className="action-buttons">
            {(isAdmin || isVolunteer) && (
              <button onClick={handleAddVoter} className="btn btn-success">
                <i className="fas fa-plus"></i> Add New Voter
              </button>
            )}
          </div>
        </div>
        {loading && (
          <LoadingSpinner 
            size="small" 
            message={`Loading voters... (Page ${currentPage + 1})`} 
          />
        )}
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <Analytics stats={stats} voters={voters} />

        

        <VoterTable
          voters={filteredVoters}
          onEdit={handleEditVoter}
          onDelete={handleDeleteVoter}
          isAdmin={isAdmin}
          isVolunteer={isVolunteer}
        />

        {/* Pagination Controls */}
        <div className="pagination-controls">
          <div className="pagination-info">
            <span>
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} voters
            </span>
            <select 
              value={pageSize} 
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="page-size-select"
            >
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={200}>200 per page</option>
              <option value={500}>500 per page</option>
            </select>
          </div>
          
          <div className="pagination-buttons">
            <button 
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              className="btn btn-secondary"
            >
              First
            </button>
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            
            <span className="page-indicator">
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="btn btn-secondary"
            >
              Next
            </button>
            <button 
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="btn btn-secondary"
            >
              Last
            </button>
          </div>
        </div>

        {showModal && (
          <VoterModal
            voter={editingVoter}
            onSave={handleSaveVoter}
            onClose={() => {
              setShowModal(false);
              setEditingVoter(null);
            }}
            isAdmin={isAdmin}
            isVolunteer={isVolunteer}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
