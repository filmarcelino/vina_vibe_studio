import React, { useState, useEffect } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp: string;
}

function App() {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [code, setCode] = useState(`function HelloWorld() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>Hello World!</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Welcome to Vina.dev Preview Runner</p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>🚀 Hot Module Replacement is active</p>
      </div>
    </div>
  );
}`);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setConnectionStatus('connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('Received message:', message);
        
        setMessages(prev => [...prev.slice(-9), message]); // Keep last 10 messages
        
        if (message.type === 'code-update' && message.data?.code) {
          setCode(message.data.code);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setConnectionStatus('disconnected');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };
    
    return () => {
      ws.close();
    };
  }, []);

  const sendTestMessage = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'test',
        message: 'Hello from React app!',
        timestamp: new Date().toISOString()
      }));
      ws.close();
    };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#1e293b', 
        color: 'white', 
        padding: '1rem 2rem',
        borderBottom: '3px solid #3b82f6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Vina.dev Preview Runner</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: connectionStatus === 'connected' ? '#10b981' : 
                               connectionStatus === 'connecting' ? '#f59e0b' : '#ef4444'
              }} />
              <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>
                {connectionStatus}
              </span>
            </div>
            <button
              onClick={sendTestMessage}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Test WebSocket
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0'
        }}>
          <h1 style={{ color: '#2563eb', marginBottom: '1rem', fontSize: '2.5rem' }}>Hello World!</h1>
          <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '2rem' }}>
            Welcome to Vina.dev Preview Runner
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#ecfdf5',
              borderRadius: '8px',
              border: '1px solid #a7f3d0'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#065f46' }}>🚀 HMR Active</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#047857' }}>
                Hot Module Replacement is working
              </p>
            </div>
            
            <div style={{
              padding: '1rem',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #93c5fd'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1d4ed8' }}>📡 WebSocket</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#2563eb' }}>
                Real-time communication ready
              </p>
            </div>
            
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #fcd34d'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>⚡ Vite</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#b45309' }}>
                Lightning fast development
              </p>
            </div>
          </div>
        </div>

        {/* WebSocket Messages */}
        {messages.length > 0 && (
          <div style={{
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            padding: '1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#f1f5f9' }}>WebSocket Messages:</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {messages.map((msg, index) => (
                <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#334155', borderRadius: '4px' }}>
                  <strong style={{ color: '#60a5fa' }}>{msg.type}:</strong> {msg.message || JSON.stringify(msg.data)}
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;