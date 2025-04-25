// src/components/FlagDetail.jsx
import '../styles/flagdetail.css';

const FlagDetail = ({ flag, onClose }) => {
  if (!flag) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flag-detail-overlay">
      <div className="flag-detail-container">
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="flag-header" style={{ backgroundColor: flag.color || '#3498db' }}>
          <h2>{flag.title || 'Flag Message'}</h2>
        </div>
        
        <div className="flag-content">
          <p className="flag-message">{flag.message}</p>
          
          <div className="flag-meta">
            {flag.createdAt && (
              <p className="flag-date">
                Posted on {formatDate(flag.createdAt)}
              </p>
            )}
            
            {flag.author && (
              <p className="flag-author">
                By {flag.author}
              </p>
            )}

            {flag.category && (
              <div className="flag-category">
                <span className="category-tag">{flag.category}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlagDetail;