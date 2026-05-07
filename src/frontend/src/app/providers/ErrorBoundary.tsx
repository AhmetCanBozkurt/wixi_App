import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: 'var(--color-danger, #ef4444)' }}>Beklenmeyen bir hata oluştu</h2>
          <p style={{ color: 'var(--text-muted, #888)', maxWidth: '400px', textAlign: 'center' }}>
            {this.state.error?.message ?? 'Lütfen sayfayı yenileyin.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '8px 24px', background: 'var(--color-primary, #3b82f6)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
