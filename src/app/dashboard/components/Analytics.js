'use client';

import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Analytics({ stats, voters }) {
  const genderData = [
    { name: 'Male', value: stats.male, color: '#0088FE' },
    { name: 'Female', value: stats.female, color: '#00C49F' }
  ];

  const ageGroups = [
    { name: '18-25', count: voters.filter(v => v.age >= 18 && v.age <= 25).length },
    { name: '26-35', count: voters.filter(v => v.age >= 26 && v.age <= 35).length },
    { name: '36-50', count: voters.filter(v => v.age >= 36 && v.age <= 50).length },
    { name: '51-65', count: voters.filter(v => v.age >= 51 && v.age <= 65).length },
    { name: '65+', count: voters.filter(v => v.age > 65).length }
  ];

  const boothData = voters.reduce((acc, voter) => {
    const booth = voter.booth;
    acc[booth] = (acc[booth] || 0) + 1;
    return acc;
  }, {});

  const boothChartData = Object.entries(boothData)
    .map(([booth, count]) => ({ booth, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Show top 10 booths
  const sentimentData = [
    { name: 'Positive', value: voters.filter(v => v.sentiment === 'Positive').length, color: '#00C49F' },
    { name: 'Neutral', value: voters.filter(v => v.sentiment === 'Neutral').length, color: '#FFBB28' },
    { name: 'Negative', value: voters.filter(v => v.sentiment === 'Negative').length, color: '#FF4C4C' }
  ];

  return (
    <div className="analytics-section">
      <h2>Analytics Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Voters</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.filtered}</div>
          <div className="stat-label">Filtered Results</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.male}</div>
          <div className="stat-label">Male Voters</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.female}</div>
          <div className="stat-label">Female Voters</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.booths}</div>
          <div className="stat-label">Total Booths</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Age Group Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageGroups}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/*  New Sentiment Pie Chart (Replaces Booth Chart) */}
        <div className="chart-card">
          <h3>Voter Sentiment Distribution</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
            <div style={{ color: '#00C49F' }}>Positive: {sentimentData.find(d => d.name === 'Positive')?.value || 0}</div>
            <div style={{ color: '#FFBB28' }}>Neutral: {sentimentData.find(d => d.name === 'Neutral')?.value || 0}</div>
            <div style={{ color: '#FF4C4C' }}>Negative: {sentimentData.find(d => d.name === 'Negative')?.value || 0}</div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`sentiment-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;

