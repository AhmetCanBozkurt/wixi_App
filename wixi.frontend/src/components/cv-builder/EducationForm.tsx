import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import type { Education } from "@/types/CVBuilderTypes";
import { Card, CardContent } from "@/components/ui/card";

interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export default function EducationForm({ data, onChange }: EducationFormProps) {
  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
    };
    onChange([...data, newEdu]);
  };

  const removeEducation = (id: string) => {
    onChange(data.filter((edu) => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    onChange(
      data.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  return (
    <div className="space-y-4">
      {data.map((edu, index) => (
        <Card key={edu.id}>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Eğitim {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEducation(edu.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Okul *</Label>
                <Input
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                  placeholder="Okul adı"
                />
              </div>

              <div>
                <Label>Derece *</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                  placeholder="Örn: Lisans, Yüksek Lisans"
                />
              </div>

              <div>
                <Label>Alan *</Label>
                <Input
                  value={edu.field}
                  onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                  placeholder="Bölüm/alan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Başlangıç Tarihi *</Label>
                  <Input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Bitiş Tarihi</Label>
                  <Input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                    disabled={edu.current}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`current-edu-${edu.id}`}
                  checked={edu.current}
                  onCheckedChange={(checked) => {
                    updateEducation(edu.id, "current", checked);
                    if (checked) {
                      updateEducation(edu.id, "endDate", "");
                    }
                  }}
                />
                <Label htmlFor={`current-edu-${edu.id}`} className="text-sm font-normal">
                  Devam ediyor
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={addEducation}
      >
        <Plus className="h-4 w-4" />
        Eğitim Ekle
      </Button>
    </div>
  );
}

