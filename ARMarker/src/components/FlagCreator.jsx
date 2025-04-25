// frontend/src/components/FlagCreator.jsx
import React, { useState } from 'react';

const FlagCreator = ({ onSubmit, onCancel }) => {
  const [flagData, setFlagData] = useState({
    title: '',
    message: '',
    color: '#FF0000', // Default red flag
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFlagData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flagData.title || !flagData.message) {
      alert('Please fill in all fields');
      return;
    }
    onSubmit(flagData);
  };

  return (
    <div className="flag-form-container">
      <form className="flag-form" onSubmit={handleSubmit}>
        <h2>Create a Flag</h2>
        
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={flagData.title}
            onChange={handleChange}
            placeholder="Enter a title for your flag"
            maxLength="50"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={flagData.message}
            onChange={handleChange}
            placeholder="Enter your message or question"
            maxLength="200"
            rows="4"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="color">Flag Color</label>
          <input
            type="color"
            id="color"
            name="color"
            value={flagData.color}
            onChange={handleChange}
          />
        </div>
        
        <div className="button-group">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" className="submit-btn">Create Flag</button>
        </div>
      </form>
    </div>
  );
};

export default FlagCreator;