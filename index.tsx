import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Componente de segurança para capturar erros e evitar tela branca permanente
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro capturado na aplicação:", error, errorInfo);
  }

  handleReset = () => {
    // Limpa dados corrompidos e recarrega
    localStorage.removeItem('painel_logistica_data');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-6 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">⚠️ Ocorreu um problema</h1>
          <p className="mb-6 text-lg">Os dados salvos podem estar incompatíveis com a nova versão.</p>
          <div className="bg-white p-4 rounded shadow mb-6 text-left overflow-auto max-w-lg max-h-40 text-xs font-mono border border-red-200">
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={this.handleReset}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold text-xl shadow-lg hover:bg-blue-700 transition-all"
          >
            Limpar Dados e Reiniciar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);