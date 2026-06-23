import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ff6b6b', background: '#0a0a0f', minHeight: '100vh', wordBreak: 'break-all', fontFamily: 'monospace' }}>
          <h2>Component Crash</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }} open>
            <summary style={{ cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' }}>View Error Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
