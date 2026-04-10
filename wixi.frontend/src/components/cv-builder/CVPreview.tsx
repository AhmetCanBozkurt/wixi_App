import type { CVData } from "@/types/CVBuilderTypes";

interface CVPreviewProps {
  data: CVData;
}

export default function CVPreview({ data }: CVPreviewProps) {
  const { personalInfo, experience, education, skills, languages, certificates } = data;

  return (
    <div className="bg-white text-black p-8 shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold mb-2">{personalInfo.fullName || "Ad Soyad"}</h1>
        <div className="text-sm space-y-1 text-gray-700">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>
      </div>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-800 pb-1 mb-3">
            Profesyonel Özet
          </h2>
          <p className="text-sm text-gray-800">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-800 pb-1 mb-3">
            İş Deneyimi
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-sm">{exp.position}</h3>
                    <div className="text-sm text-gray-700">{exp.company}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exp.startDate} - {exp.current ? "Devam ediyor" : exp.endDate}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-sm text-gray-800 mt-2">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-800 pb-1 mb-3">
            Eğitim
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{edu.degree} - {edu.field}</h3>
                    <div className="text-sm text-gray-700">{edu.school}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {edu.startDate} - {edu.current ? "Devam ediyor" : edu.endDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-800 pb-1 mb-3">
            Beceriler
          </h2>
          <div className="text-sm text-gray-800">
            {skills.map((skill) => skill.name).join(" • ")}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-800 pb-1 mb-3">
            Diller
          </h2>
          <div className="space-y-1">
            {languages.map((lang) => (
              <div key={lang.id} className="text-sm text-gray-800">
                <span className="font-semibold">{lang.language}:</span> {lang.proficiency}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-800 pb-1 mb-3">
            Sertifikalar
          </h2>
          <div className="space-y-2">
            {certificates.map((cert) => (
              <div key={cert.id} className="text-sm">
                <div className="font-semibold text-gray-800">{cert.name}</div>
                <div className="text-gray-700">{cert.issuer} • {cert.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

