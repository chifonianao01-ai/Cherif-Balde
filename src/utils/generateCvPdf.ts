import { jsPDF } from 'jspdf';
import type { LanguageCode, PortfolioData } from '../types/portfolio';

export function downloadPortfolioCv(portfolio: PortfolioData, lang: LanguageCode): void {
  const { profile } = portfolio;

  // Si un CV PDF personnalisé a été téléversé par Cherif dans l'administration, le télécharger directement
  if (profile.cvPdfUrl && profile.cvPdfUrl.trim()) {
    const link = document.createElement('a');
    link.href = profile.cvPdfUrl;
    link.download = 'CV_Cherif_Balde.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Sinon, générer un CV PDF structuré et à jour à partir des données du portfolio
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxLineWidth = pageWidth - margin * 2;
  let y = 20;

  const ensureSpace = (needed = 14) => {
    if (y + needed > pageHeight - 16) {
      doc.addPage();
      y = 20;
    }
  };

  // Bandeau d'en-tête sobre noir & doré
  doc.setFillColor(11, 11, 13);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(profile.fullName.toUpperCase(), margin, 18);

  doc.setTextColor(200, 164, 93);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(lang === 'fr' ? profile.titleFr : profile.titleEn, margin, 26);

  doc.setTextColor(210, 210, 215);
  doc.setFontSize(9);
  const contactLine = [
    lang === 'fr' ? profile.locationFr : profile.locationEn,
    profile.email,
    profile.phone,
    profile.websiteUrl,
  ]
    .filter(Boolean)
    .join('  •  ');
  doc.text(contactLine, margin, 34);

  y = 52;

  const addSectionTitle = (title: string) => {
    ensureSpace(16);
    doc.setTextColor(11, 11, 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(200, 164, 93);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // Profil
  addSectionTitle(lang === 'fr' ? 'Profil' : 'Profile');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 56);
  const bioLines = doc.splitTextToSize(
    (lang === 'fr' ? profile.aboutStoryFr : profile.aboutStoryEn).slice(0, 3).join(' '),
    maxLineWidth
  );
  doc.text(bioLines, margin, y);
  y += bioLines.length * 4.5 + 5;

  // Expériences professionnelles
  addSectionTitle(lang === 'fr' ? 'Expériences professionnelles' : 'Professional Experience');
  for (const exp of portfolio.experiences) {
    ensureSpace(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(11, 11, 13);
    doc.text(lang === 'fr' ? exp.roleFr : exp.roleEn, margin, y);
    y += 4.5;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 120);
    doc.text(
      `${lang === 'fr' ? exp.companyOrSectorFr : exp.companyOrSectorEn} — ${exp.location} (${exp.period})`,
      margin,
      y
    );
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 56);
    const missions = lang === 'fr' ? exp.missionsFr : exp.missionsEn;
    for (const mission of missions) {
      const mLines = doc.splitTextToSize(`• ${mission}`, maxLineWidth - 4);
      ensureSpace(mLines.length * 4.2 + 2);
      doc.text(mLines, margin + 2, y);
      y += mLines.length * 4.2;
    }
    y += 4;
  }

  // Parcours académique
  addSectionTitle(lang === 'fr' ? 'Parcours académique' : 'Education');
  for (const edu of portfolio.education) {
    ensureSpace(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(11, 11, 13);
    const statusNote =
      edu.status === 'envisaged'
        ? lang === 'fr'
          ? ' [Envisagée]'
          : ' [Planned]'
        : '';
    doc.text(`${edu.period} — ${lang === 'fr' ? edu.titleFr : edu.titleEn}${statusNote}`, margin, y);
    y += 4.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(95, 95, 105);
    doc.text(`${edu.institution} (${edu.location})`, margin + 2, y);
    y += 5.5;
  }

  // Compétences
  addSectionTitle(lang === 'fr' ? 'Compétences & Outils' : 'Skills & Tools');
  const groups: Array<{ label: string; items: string[] }> = [
    {
      label: lang === 'fr' ? 'Développement web' : 'Web Development',
      items: portfolio.skills
        .filter((s) => s.category === 'web')
        .map((s) => (lang === 'fr' ? s.nameFr : s.nameEn)),
    },
    {
      label: lang === 'fr' ? 'Multimédia' : 'Multimedia',
      items: portfolio.skills
        .filter((s) => s.category === 'multimedia')
        .map((s) => (lang === 'fr' ? s.nameFr : s.nameEn)),
    },
    {
      label: lang === 'fr' ? 'Outils' : 'Tools',
      items: portfolio.skills
        .filter((s) => s.category === 'tools')
        .map((s) => (lang === 'fr' ? s.nameFr : s.nameEn)),
    },
  ];
  for (const grp of groups) {
    if (grp.items.length === 0) continue;
    const text = `${grp.label} : ${grp.items.join(', ')}`;
    const lines = doc.splitTextToSize(text, maxLineWidth);
    ensureSpace(lines.length * 4.5 + 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(45, 45, 52);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 2;
  }
  y += 3;

  // Langues
  addSectionTitle(lang === 'fr' ? 'Langues' : 'Languages');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(45, 45, 52);
  const langLine = portfolio.languages
    .map(
      (l) =>
        `${lang === 'fr' ? l.nameFr : l.nameEn} (${lang === 'fr' ? l.proficiencyFr : l.proficiencyEn})`
    )
    .join('   •   ');
  const langLines = doc.splitTextToSize(langLine, maxLineWidth);
  ensureSpace(langLines.length * 4.5 + 4);
  doc.text(langLines, margin, y);

  doc.save('CV_Cherif_Balde.pdf');
}
