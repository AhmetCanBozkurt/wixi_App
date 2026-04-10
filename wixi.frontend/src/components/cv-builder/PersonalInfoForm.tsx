import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PersonalInfo } from "@/types/CVBuilderTypes";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export default function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const updateField = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Ad Soyad *</Label>
        <Input
          value={data.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          placeholder="Adınız ve soyadınız"
        />
      </div>

      <div>
        <Label>E-posta *</Label>
        <Input
          type="email"
          value={data.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="ornek@email.com"
        />
      </div>

      <div>
        <Label>Telefon *</Label>
        <Input
          value={data.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="+90 555 123 45 67"
        />
      </div>

      <div>
        <Label>Konum *</Label>
        <Input
          value={data.location}
          onChange={(e) => updateField("location", e.target.value)}
          placeholder="Şehir, Ülke"
        />
      </div>

      <div>
        <Label>Özet</Label>
        <Textarea
          value={data.summary || ""}
          onChange={(e) => updateField("summary", e.target.value)}
          placeholder="Kısa bir profesyonel özet yazın..."
          className="min-h-[100px] resize-none"
        />
      </div>
    </div>
  );
}

