import { Component } from 'react';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App render failed:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white px-6 py-16">
          <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-300">
              Render Error
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
              The page crashed before it could render.
            </h1>
            <pre className="mt-6 overflow-auto rounded-2xl bg-black/40 p-4 text-sm text-red-100">
              {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
