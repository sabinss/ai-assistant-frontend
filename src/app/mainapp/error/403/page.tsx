"use client"
import React from 'react';

const ForbiddenPage = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5',
            fontFamily: '"Roboto", sans-serif'
        }}>
            <h1 style={{
                fontSize: '4rem',
                fontWeight: 700,
                color: '#333',
                marginBottom: '1rem'
            }}>403</h1>
            <p style={{
                fontSize: '1.5rem',
                color: '#666',
                marginBottom: '2rem'
            }}>You are not authorized to access this page.</p>
            <button onClick={() => window.history.back()} style={{
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
            }}>
                Go Back
            </button>
        </div>
    );
};

export default ForbiddenPage;