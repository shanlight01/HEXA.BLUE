'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, LOME_NEIGHBORHOODS, type ServiceCategory } from '@/types';

export default function RegisterServicePage() {
  const router = useRouter();
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [location, setLocation] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [priceRange, setPriceRange] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // In a real app, this would call activateProviderProfile from firestore.ts
    // For hackathon demo, simulate success
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="empty-state" style={{ paddingTop: 'var(--space-3xl)' }}>
          <div className="empty-state__icon">🎉</div>
          <p className="empty-state__text">Profil prestataire créé avec succès !</p>
          <p className="empty-state__hint">
            Vous serez maintenant recommandé par notre IA. Redirection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-service-page page-container">
      <h1>Proposer vos services ✨</h1>
      <p className="subtitle">
        Remplissez ce formulaire pour devenir prestataire et être recommandé par l&apos;IA
      </p>

      <form onSubmit={handleSubmit}>
        {/* Category */}
        <div className="form-group">
          <label htmlFor="service-category" className="form-label">Catégorie de service *</label>
          <select
            id="service-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ServiceCategory)}
            className="form-select"
            required
          >
            <option value="">-- Choisir une catégorie --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Skills */}
        <div className="form-group">
          <label className="form-label">Compétences * ({skills.length}/10)</label>
          <div className="skills-input-container">
            {skills.map((skill) => (
              <span key={skill} className="skill-chip">
                {skill}
                <button
                  type="button"
                  className="skill-chip__remove"
                  onClick={() => removeSkill(skill)}
                >
                  ✕
                </button>
              </span>
            ))}
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={addSkill}
              placeholder={skills.length === 0 ? 'Tapez une compétence puis Entrée' : 'Ajouter...'}
              className="skills-text-input"
            />
          </div>
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="service-location" className="form-label">Quartier de Lomé *</label>
          <select
            id="service-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-select"
            required
          >
            <option value="">-- Votre quartier --</option>
            {LOME_NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* WhatsApp */}
        <div className="form-group">
          <label htmlFor="service-whatsapp" className="form-label">Numéro WhatsApp *</label>
          <input
            id="service-whatsapp"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+228 90 12 34 56"
            className="form-input"
            required
          />
        </div>

        {/* Price Range */}
        <div className="form-group">
          <label className="form-label">Gamme de prix</label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                className={`category-pill ${priceRange === p ? 'category-pill--active' : ''}`}
                onClick={() => setPriceRange(p)}
                style={{ '--pill-color': p === 'low' ? '#10b981' : p === 'medium' ? '#f59e0b' : '#ef4444' } as React.CSSProperties}
              >
                {p === 'low' && '💚 Abordable'}
                {p === 'medium' && '💛 Moyen'}
                {p === 'high' && '💎 Premium'}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="form-group">
          <label htmlFor="service-bio" className="form-label">Bio / Description</label>
          <textarea
            id="service-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Décrivez votre expérience et vos spécialités..."
            className="form-textarea"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !category || skills.length === 0 || !location || !whatsapp}
          style={{ marginTop: 'var(--space-lg)' }}
        >
          {loading ? '⏳ Création du profil...' : '🚀 Devenir Prestataire'}
        </button>
      </form>
    </div>
  );
}
