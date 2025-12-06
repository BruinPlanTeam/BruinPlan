import '../styles/SessionExpiredPopup.css';

export function SessionExpiredPopup({ onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div className="session-expired-backdrop" onClick={onClose} />
      
      {/* Modal */}
      <div className="session-expired-modal">
        {/* Header */}
        <div className="session-expired-header">
          <div className="session-expired-title">
            <svg 
              className="session-expired-icon" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <h2>Session Expired</h2>
          </div>
          <button className="session-expired-close-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="session-expired-content">
          <p>Your session has expired. Please log back in to continue planning.</p>
        </div>
      </div>
    </>
  );
}

