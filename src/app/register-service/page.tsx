/**
 * src/app/register-service/page.tsx
 * 
 * Formulaire public pour qu'un utilisateur devienne un Prestataire de Service.
 * Les données gérées ici sont critiques pour l'algorithme de Matchmaking.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, LOME_NEIGHBORHOODS, type ServiceCategory } from '@/types';

export default function RegisterServicePage() {
  const router = useRouter();
  
  // States du formulaire
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [location, setLocation] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [priceRange, setPriceRange] = useState<'low' | 'medium' | 'high'>('medium');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /**
   * Ajoute une compétence au tableau (max 10)
   */
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  /**
   * Retire une compétence du tableau
   */
  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Permet d'ajouter une compétence en appuyant sur Entrée ou Virgule
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // FIX: Dans une vraie app, on appelle `activateProviderProfile` depuis firestore.ts ici
    // Pour la démo hackathon, on simule un succès réseau de 1.5s
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSuccess(true);
    setLoading(false);

    // Redirige vers le dashboard après un court délai
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
        Remplissez ce formulaire pour devenir prestataire et être recommandé par notre intelligence artificielle.
      </p>

      <form onSubmit={handleSubmit} className="auth-card" style={{ maxWidth: '100%', padding: 'var(--space-xl)' }}>
        {/* Catégorie */}
        <div className="form-group">
          <label htmlFor="service-category" className="form-label">Catégorie de service principale *</label>
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

        {/* Compétences (Mots-clés pour l'IA) */}
        <div className="form-group">
          <label className="form-label">Compétences clés * ({skills.length}/10)</label>
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
              placeholder={skills.length === 0 ? 'Ex: Tresses africaines (Appuyez sur Entrée)' : 'Ajouter une autre...'}
              className="skills-text-input"
            />
          </div>
          <small style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            L&apos;IA utilise ces mots pour vous trouver plus facilement.
          </small>
        </div>

        {/* Localisation / Quartier */}
        <div className="form-group">
          <label htmlFor="service-location" className="form-label">Votre quartier principal à Lomé *</label>
          <select
            id="service-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-select"
            required
          >
            <option value="">-- Sélectionnez votre quartier --</option>
            {LOME_NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Contact WhatsApp */}
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

        {/* Gamme de Prix (Boutons pour UX mobile) */}
        <div className="form-group">
          <label className="form-label">Gamme de prix générale</label>
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
                {p === 'medium' && '💛 Standard'}
                {p === 'high' && '💎 Premium'}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="form-group">
          <label htmlFor="service-bio" className="form-label">Biographie et Description détaillée</label>
          <textarea
            id="service-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Décrivez votre expérience professionnelle, vos spécialités, et pourquoi les clients devraient vous choisir..."
            className="form-textarea"
            rows={4}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !category || skills.length === 0 || !location || !whatsapp}
          style={{ marginTop: 'var(--space-lg)', padding: '16px' }}
        >
          {loading ? '⏳ Création du profil en cours...' : '🚀 Activer mon Profil Prestataire'}
        </button>
      </form>
    </div>
  );
}
