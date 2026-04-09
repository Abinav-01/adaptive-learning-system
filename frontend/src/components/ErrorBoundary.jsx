import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex justify-center items-center p-6 text-center">
          <div className="bg-[#111] border border-red-500/30 rounded-2xl p-10 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h2>
            <p className="text-gray-400 mb-8">An unexpected error crashed this view. Please refresh to continue.</p>
            <button 
                onClick={() => window.location.reload()} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 py-3 font-bold transition-colors w-full"
            >
                Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
