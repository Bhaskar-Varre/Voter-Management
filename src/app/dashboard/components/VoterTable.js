'use client';

import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import './VoterTable.css';

// Define your display fields and column headers
const FIELD_MAP = [
 

{ key: 'id', label: 'ID' },
  { key: 'vid_no', label: 'Voter ID (VID)' },
  { key: 'booth', label: 'Booth' },
  { key: 'age', label: 'Age' },
  { key: 'gender', label: 'Gender' },
  { key: 'fm_name_en', label: 'First Name' },
  { key: 'surname', label: 'Last Name' },
  { key: 'relation', label: 'Relation' },
  { key: 'relationnameen', label: 'Relation Name' },
  { key: 'mobile_no', label: 'Mobile No' },
  { key: 'area_or_colony', label: 'Area' },
  { key: 'influencer', label: 'Influencer' },
  { key: 'sentiment', label: 'Sentiment' },
  { key: 'comment_primary', label: 'Comment' },
  

];


const VoterRow = React.memo(({ data, index, style }) => {
  const { voters = [], onEdit, onDelete, isAdmin, isVolunteer } = data;
  const voter = voters[index];
  if (!voter) return <div style={style} className="table-row empty-row" />;

  return (
    <div className="table-row" style={style}>
      {FIELD_MAP.map(({ key }) => (
        <div key={`${voter.id}-${key}`} className="table-cell">
          {voter[key] ?? ''}
        </div>
      ))}
      <div className="table-cell action-buttons">
        {(isAdmin || isVolunteer) && (
          <button onClick={() => onEdit(voter)} className="btn btn-sm btn-primary">Edit</button>
        )}
        {isAdmin && (
          <button onClick={() => onDelete(voter.id)} className="btn btn-sm btn-danger">Delete</button>
        )}
      </div>
    </div>
  );
});

VoterRow.displayName = 'VoterRow';

const VoterTable = React.memo(({ voters = [], onEdit, onDelete, isAdmin, isVolunteer }) => {
  if (!Array.isArray(voters) || voters.length === 0) {
    return (
      <div className="card">
        <div className="no-data">
          <i className="fas fa-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
          <h3>No voters found</h3>
          <p>Try adjusting your search criteria or filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voter-table card">
      <div className="table-header">
        {FIELD_MAP.map(({ key, label }) => (
          <div key={`header-${key}`} className="table-cell">{label}</div>
        ))}
        <div className="table-cell">Actions</div>
      </div>

      <div className="table-body" style={{ height: '500px' }}>
        <AutoSizer>
          {({ height }) => (
            <List
              height={height}
              itemCount={voters.length}
              itemSize={50}
              width={2300}
              itemData={{ voters, onEdit, onDelete, isAdmin, isVolunteer }}
            >
              {VoterRow}
            </List>
          )}
        </AutoSizer>
      </div>

      <div className="table-footer">
        <p>Showing {voters.length} voter{voters.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
});

VoterTable.displayName = 'VoterTable';

export default VoterTable;
