import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import type { Experience } from "@/types/CVBuilderTypes";
import { Card, CardContent } from "@/components/ui/card";

interface ExperienceFormProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export default function ExperienceForm({ data, onChange }: ExperienceFormProps) {
  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    onChange([...data, newExp]);
  };

  const removeExperience = (id: string) => {
    onChange(data.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    onChange(
      data.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  return (
    <div className="space-y-4">
      {data.map((exp, index) => (
        <Card key={exp.id}>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">İş Deneyimi {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeExperience(exp.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Şirket *</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                  placeholder="Şirket adı"
                />
              </div>

              <div>
                <Label>Pozisyon *</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                  placeholder="Pozisyon adı"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Başlangıç Tarihi *</Label>
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Bitiş Tarihi</Label>
                  <Input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                    disabled={exp.current}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`current-${exp.id}`}
                  checked={exp.current}
                  onCheckedChange={(checked) => {
                    updateExperience(exp.id, "current", checked);
                    if (checked) {
                      updateExperience(exp.id, "endDate", "");
                    }
                  }}
                />
                <Label htmlFor={`current-${exp.id}`} className="text-sm font-normal">
                  Devam ediyor
                </Label>
              </div>

              <div>
                <Label>Açıklama</Label>
                <Textarea
                  value={exp.description || ""}
                  onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                  placeholder="İş tanımı ve sorumluluklar..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={addExperience}
      >
        <Plus className="h-4 w-4" />
        İş Deneyimi Ekle
      </Button>
    </div>
  );
}

