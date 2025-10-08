'use client';

import React, { useState, useEffect } from 'react';


const INITIAL_VOTER = {
  id: '',
  age: '',
  booth: '',
  c_house_no: '',
  caste: '',
  fm_name_en: '',
  gender: 'Male',
  lastname_en: '',
  mobile_no: '',
  polling_st_address: '',
  relation: '',
  relationname: '',
  relationnameen: '',
  relationsurname: '',
  relationsurnameen: '',
  relegion: '',
  surname: '',
  vid_no: '',
  fm_name_v1: '',
  lastname_v1: '',
  pollingst_addresss: '',
  comment1: '',
  comment2: '',
  sentiment: 'neutral',
};

function VoterModal({ voter, onSave, onClose, isAdmin, isVolunteer }) {
  const [formData, setFormData] = useState(INITIAL_VOTER);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (voter) {
      setFormData({ ...INITIAL_VOTER, ...voter });
    } else {
      // Removing client-side ID generation as the database will handle it.
      setFormData(INITIAL_VOTER);
    }
  }, [voter]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent changes if user is a viewer
    if (!isAdmin && !isVolunteer) {
      return;
    }

    // Restrict volunteer editing to specific fields
    if (isVolunteer && name !== 'caste' && name !== 'mobile_no') {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'age', 'gender', 'booth', 'address', 'phone', 'voterId'];
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = `${field} is required`;
      }
    });

    if (formData.age < 18 || formData.age > 120) {
      newErrors.age = 'Age must be between 18 and 120';
    }

    if (!/^\d{10}$/.test(formData.mobile_no)) {
      newErrors.mobile_no = 'Mobile number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent form submission if user is a viewer
    if (!isAdmin && !isVolunteer) {
      return;
    }
    
    if (!validateForm()) return;

    // Send as an array of 1 object as expected by backend
    try {
      const response = await fetch('/api/voters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([formData])
      });

      if (!response.ok) {
        throw new Error(`Failed to save voter: ${response.status}`);
      }

      const data = await response.json();
      onSave(data[0]); // Send saved voter back to parent
      onClose();
    } catch (error) {
      console.error('Save voter failed:', error);
      alert('Error saving voter. Check console for details.');
    }
  };

  const renderInput = (label, name, type = 'text', required = false) => (
    <div className="form-group">
      <label>{label}{required ? ' *' : ''}</label>
      <input
        type={type}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className={`form-control ${errors[name] ? 'error' : ''}`}
        disabled={!isAdmin && !isVolunteer || (isVolunteer && name !== 'caste' && name !== 'mobile_no')}
      />
      {errors[name] && <div className="error-text">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{voter ? 'Edit Voter' : 'Add New Voter'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            {renderInput('First Name', 'firstName', 'text', true)}
            {renderInput('Last Name', 'lastName', 'text', true)}
          </div>

          <div className="form-row">
            {renderInput('Surname', 'surname')}
            {renderInput('Voter ID', 'voterId', 'text', true)}
          </div>

          <div className="form-row">
            {renderInput('Age', 'age', 'number', true)}
            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="form-control">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {renderInput('Booth', 'booth', 'text', true)}
          {renderInput('Mobile No', 'mobile_no', 'tel', true)}
          {renderInput('Polling Station Address', 'polling_st_address', 'text', true)}

          {/* Optional fields */}
          <hr />
          <h4>Additional Details</h4>
          <div className="form-row">{renderInput('C_House_No', 'c_house_no')}</div>
          <div className="form-row">{renderInput('Caste', 'caste')}</div>
          <div className="form-row">{renderInput('First Name (EN)', 'fm_name_en')}</div>
          <div className="form-row">{renderInput('Last Name (EN)', 'lastname_en')}</div>
          <div className="form-row">{renderInput('Relation', 'relation')}</div>
          <div className="form-row">{renderInput('Relation Name', 'relationname')}</div>
          <div className="form-row">{renderInput('Relation Name (EN)', 'relationnameen')}</div>
          <div className="form-row">{renderInput('Relation Surname', 'relationsurname')}</div>
          <div className="form-row">{renderInput('Relation Surname (EN)', 'relationsurnameen')}</div>
          <div className="form-row">{renderInput('Religion', 'relegion')}</div>
          <div className="form-row">{renderInput('Surname', 'surname')}</div>
          <div className="form-row">{renderInput('Voter ID (VID)', 'vid_no')}</div>
          <div className="form-row">{renderInput('First Name (V1)', 'fm_name_v1')}</div>
          <div className="form-row">{renderInput('Last Name (V1)', 'lastname_v1')}</div>
          <div className="form-row">{renderInput('Polling Station Address (S)', 'pollingst_addresss')}</div>
          <div className="form-row">{renderInput('Comment 1', 'comment1')}</div>
          <div className="form-row">{renderInput('Comment 2', 'comment2')}</div>
          <div className="form-row">
            <div className="form-group">
              <label>Sentiment</label>
              <select name="sentiment" value={formData.sentiment} onChange={handleChange} className="form-control"
                      disabled={!isAdmin && !isVolunteer || (isVolunteer && name !== 'caste' && name !== 'mobile_no')}>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!isAdmin && !isVolunteer}>
              {voter ? 'Update Voter' : 'Add Voter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VoterModal;
