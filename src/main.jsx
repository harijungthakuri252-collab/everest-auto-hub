import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#0a0a0a', color: '#f97316', minHeight: '100vh' }}>
          <h2>App Error — Please share this with developer</h2>
          <pre style={{ color: '#ff6b6b', whiteSpace: 'pre-wrap', fontSize: '0.85rem', marginBottom: 20 }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ color: '#aaa', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
            {this.state.info?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
