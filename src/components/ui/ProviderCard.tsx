import type { User, MatchResult } from '@/types';
import WhatsAppButton from './WhatsAppButton';

interface ProviderCardProps {
  result: MatchResult;
}

export default function ProviderCard({ result }: ProviderCardProps) {
  const { provider, score, breakdown } = result;
  const profile = provider.serviceProfile!;

  const scorePercent = Math.round(score * 100);
  const stars = '★'.repeat(Math.round(profile.rating)) + '☆'.repeat(5 - Math.round(profile.rating));

  return (
    <div className={`provider-card ${!profile.isAvailable ? 'provider-card--unavailable' : ''}`}>
      <div className="provider-card__header">
        <div className="provider-card__avatar">
          {provider.name.charAt(0)}
        </div>
        <div className="provider-card__info">
          <h3 className="provider-card__name">{provider.name}</h3>
          <span className="provider-card__category">{profile.category}</span>
        </div>
        <div className="provider-card__score">
          <span className="provider-card__score-value">{scorePercent}%</span>
          <span className="provider-card__score-label">match</span>
        </div>
      </div>

      <div className="provider-card__rating">
        <span className="provider-card__stars">{stars}</span>
        <span className="provider-card__rating-number">{profile.rating.toFixed(1)}</span>
        {profile.completedJobs && (
          <span className="provider-card__jobs">· {profile.completedJobs} missions</span>
        )}
      </div>

      <div className="provider-card__details">
        <div className="provider-card__detail">
          <span className="provider-card__detail-icon">📍</span>
          <span>{profile.location}</span>
        </div>
        <div className="provider-card__detail">
          <span className="provider-card__detail-icon">
            {profile.isAvailable ? '🟢' : '🔴'}
          </span>
          <span>{profile.isAvailable ? 'Disponible' : 'Indisponible'}</span>
        </div>
        {profile.priceRange && (
          <div className="provider-card__detail">
            <span className="provider-card__detail-icon">💰</span>
            <span>
              {profile.priceRange === 'low' && 'Prix abordable'}
              {profile.priceRange === 'medium' && 'Prix moyen'}
              {profile.priceRange === 'high' && 'Premium'}
            </span>
          </div>
        )}
      </div>

      <div className="provider-card__skills">
        {profile.skills.map((skill) => (
          <span key={skill} className="provider-card__skill-tag">
            {skill}
          </span>
        ))}
      </div>

      {profile.bio && (
        <p className="provider-card__bio">{profile.bio}</p>
      )}

      <div className="provider-card__actions">
        <WhatsAppButton phone={profile.whatsapp} providerName={provider.name} />
        <button className="provider-card__details-btn">
          Voir le profil
        </button>
      </div>
    </div>
  );
}
