import React from 'react';

const TransitionLoader = () => (
  <div className="loader">
    <style jsx>{`
      .loader {
        border: 8px solid #f3f3f3; /* Light grey */
        border-top: 8px solid #fe5e00; /* magenta */
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 2s linear infinite;
        margin-left: auto;
        margin-right: auto;
        margin-top: 40px;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}
    </style>
  </div>
);

export default TransitionLoader;
