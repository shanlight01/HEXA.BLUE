'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [isProvider, setIsProvider] = useState(false);

  if (authLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state__icon">🔒</div>
          <p className="empty-state__text">Connectez-vous pour accéder au tableau de bord</p>
          <Link href="/login" className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '12px 32px', marginTop: '16px' }}>
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">
          Bonjour, {user.displayName || 'Utilisateur'} ! 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Bienvenue sur votre tableau de bord QuickService
        </p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card__value">0</div>
          <div className="stat-card__label">Recherches effectuées</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">0</div>
          <div className="stat-card__label">Prestataires contactés</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">⭐</div>
          <div className="stat-card__label">Favoris</div>
        </div>
      </div>

      {/* Provider Toggle */}
      <div className="provider-toggle">
        <div className="provider-toggle__info">
          <h3>🎯 Devenir Prestataire</h3>
          <p>Activez votre profil prestataire pour être recommandé par l&apos;IA</p>
        </div>
        <button
          className={`toggle-switch ${isProvider ? 'toggle-switch--active' : ''}`}
          onClick={() => {
            if (!isProvider) {
              // Redirect to register-service form
              window.location.href = '/register-service';
            } else {
              setIsProvider(false);
            }
          }}
          aria-label="Activer profil prestataire"
        >
          <span className="toggle-switch__knob" />
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gap: 'var(--space-md)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <Link href="/search" className="btn-secondary" style={{ textAlign: 'center' }}>
          🔍 Rechercher un service
        </Link>
        <Link href="/register-service" className="btn-primary" style={{ textAlign: 'center' }}>
          ➕ Proposer mes services
        </Link>
      </div>
    </div>
  );
}
