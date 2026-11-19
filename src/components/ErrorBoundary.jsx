import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('[3D]', error);
  }

  render() {
    if (this.state.error) return this.props.fallback?.(this.state.error, () => this.setState({ error: null }));
    return this.props.children;
  }
}
