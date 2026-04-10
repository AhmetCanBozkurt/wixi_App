import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import type { Skill } from "@/types/CVBuilderTypes";
import { useState } from "react";

interface SkillsFormProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

export default function SkillsForm({ data, onChange }: SkillsFormProps) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    if (input.trim()) {
      const newSkill: Skill = {
        id: crypto.randomUUID(),
        name: input.trim(),
      };
      onChange([...data, newSkill]);
      setInput("");
    }
  };

  const removeSkill = (id: string) => {
    onChange(data.filter((skill) => skill.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Beceri adı yazın ve Enter'a basın"
        />
        <Button
          type="button"
          onClick={addSkill}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Ekle
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.map((skill) => (
          <Badge
            key={skill.id}
            variant="secondary"
            className="gap-1 pl-3 pr-2 py-1"
          >
            {skill.name}
            <button
              type="button"
              onClick={() => removeSkill(skill.id)}
              className="hover:bg-secondary/80 rounded-sm"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

