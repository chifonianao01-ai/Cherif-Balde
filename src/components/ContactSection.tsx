import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import type { LanguageCode, ProfileData } from '../types/portfolio';
import { UI_TEXT } from '../i18n/translations';

interface ContactSectionProps {
  profile: ProfileData;
  lang: LanguageCode;
}

export function ContactSection({ profile, lang }: ContactSectionProps) {
  const t = UI_TEXT[lang];
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const rawWhatsapp = (profile.social.whatsapp || profile.phone || '').replace(/[^\d]/g, '');
  const whatsappUrl = rawWhatsapp ? `https://wa.me/${rawWhatsapp}` : '';

  const socialEntries = [
    { label: 'GitHub', url: profile.social.github },
    { label: 'LinkedIn', url: profile.social.linkedin },
    { label: 'TikTok', url: profile.social.tiktok },
    { label: lang === 'fr' ? 'Autre lien' : 'Other link', url: profile.social.other },
  ].filter((item) => Boolean(item.url && item.url.trim()));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, subject, message }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        emailDispatched?: boolean;
        error?: string;
      };

      if (!response.ok || !data.success) {
        setFeedback({
          type: 'error',
          text:
            data.error ||
            (lang === 'fr'
              ? 'L’envoi a échoué. Veuillez vérifier vos informations.'
              : 'Message delivery failed. Please check your input.'),
        });
        return;
      }

      setFeedback({
        type: 'success',
        text: data.emailDispatched ? t.contact.successEmailAndInbox : t.contact.successInboxOnly,
      });
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setFeedback({
        type: 'error',
        text:
          lang === 'fr'
            ? 'Impossible de contacter le serveur pour le moment.'
            : 'Unable to reach the server right now.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="bg-[#FAFAFA] py-20 dark:bg-[#0B0B0D] lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-[#9A7B38] dark:text-[#C8A45D]">
            10. {t.contact.kicker}
          </p>
          <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-tight text-[#0B0B0D] sm:text-4xl dark:text-white">
            {t.contact.heading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Coordonnées directes */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]">
              <h3 className="text-base font-semibold text-[#0B0B0D] dark:text-white">
                {t.contact.infoTitle}
              </h3>

              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A45D]" />
                  <div>
                    <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t.contact.emailLabel}
                    </dt>
                    <dd className="mt-0.5 font-medium text-[#0B0B0D] dark:text-white">
                      <a
                        href={`mailto:${profile.email}`}
                        className="hover:text-[#9A7B38] hover:underline dark:hover:text-[#C8A45D]"
                      >
                        {profile.email}
                      </a>
                    </dd>
                  </div>
                </div>

                {profile.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A45D]" />
                    <div>
                      <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                        {t.contact.phoneLabel}
                      </dt>
                      <dd className="font-mono-tabular mt-0.5 font-medium text-[#0B0B0D] dark:text-white">
                        <a
                          href={`tel:${profile.phone.replace(/\s+/g, '')}`}
                          className="hover:underline"
                        >
                          {profile.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A45D]" />
                  <div>
                    <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t.contact.locationLabel}
                    </dt>
                    <dd className="mt-0.5 font-medium text-[#0B0B0D] dark:text-white">
                      {lang === 'fr' ? profile.locationFr : profile.locationEn}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A45D]" />
                  <div>
                    <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t.contact.websiteLabel}
                    </dt>
                    <dd className="mt-0.5 font-medium text-[#0B0B0D] dark:text-white">
                      <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {profile.websiteUrl}
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>

              {/* Bouton WhatsApp dynamique lorsque le numéro est renseigné */}
              {whatsappUrl && (
                <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-white/10">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#C8A45D] px-4 py-2.5 text-sm font-semibold text-[#0B0B0D] transition-colors hover:bg-[#D6B572]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{t.contact.whatsappCta}</span>
                  </a>
                </div>
              )}
            </div>

            {socialEntries.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]">
                <h3 className="text-sm font-semibold text-[#0B0B0D] dark:text-white">
                  {t.contact.socialTitle}
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {socialEntries.map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-[#C8A45D] dark:border-white/15 dark:text-zinc-200"
                    >
                      <span>{item.label}</span>
                      <ExternalLink className="h-3 w-3 text-[#C8A45D]" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Formulaire de contact fonctionnel */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-[#141418]"
            >
              <h3 className="text-base font-semibold text-[#0B0B0D] dark:text-white">
                {t.contact.formTitle}
              </h3>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {t.contact.nameLabel}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    minLength={2}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-[#0B0B0D] outline-none transition-colors focus:border-[#C8A45D] dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {t.contact.emailInputLabel}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-[#0B0B0D] outline-none transition-colors focus:border-[#C8A45D] dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {t.contact.subjectLabel}
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  minLength={2}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-[#0B0B0D] outline-none transition-colors focus:border-[#C8A45D] dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {t.contact.messageLabel}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  minLength={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-[#0B0B0D] outline-none transition-colors focus:border-[#C8A45D] dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                />
              </div>

              {feedback && (
                <div
                  role="status"
                  className={`mt-5 flex items-start gap-2.5 rounded-lg border p-3.5 text-xs font-medium ${
                    feedback.type === 'success'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8A45D] px-6 py-3 text-sm font-semibold text-[#0B0B0D] transition-colors hover:bg-[#D6B572] disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? t.contact.sendingBtn : t.contact.submitBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
