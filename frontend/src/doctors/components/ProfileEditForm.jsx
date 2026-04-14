import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Type, 
  Stethoscope, 
  Phone, 
  Globe, 
  GraduationCap, 
  Building2 
} from "lucide-react";

const SPECIALTIES = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic Surgeon",
  "Gynecologist",
  "Neurologist",
  "Psychiatrist",
  "ENT Specialist",
  "Ophthalmologist",
];

export function ProfileEditForm({ profile, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState({
    specialty: profile?.specialty || "General Physician",
    contactNo: profile?.contactNo || "",
    gender: profile?.gender || "male",
    bio: profile?.bio || "",
    languages: profile?.languages || [],
    educations: profile?.educations || [],
    workingHospitals: profile?.workingHospitals || [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // List management helpers
  const addItem = (listKey, newItem) => {
    setFormData((prev) => ({ ...prev, [listKey]: [...prev[listKey], newItem] }));
  };

  const removeItem = (listKey, index) => {
    setFormData((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
  };

  const updateItem = (listKey, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [listKey]: prev[listKey].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Settings */}
        <Card className="border-white/5 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary" /> Professional Basics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Specialty</Label>
              <Select
                value={formData.specialty}
                onValueChange={(v) => handleSelectChange("specialty", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => handleSelectChange("gender", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contact Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card className="border-white/5 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" /> Biography
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>A brief professional summary</Label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={6}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[160px]"
                placeholder="Write about your expertise, philosophy of care, and achievements..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Languages */}
      <Card className="border-white/5 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Languages
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addItem("languages", "")}
            className="h-8 px-2"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {formData.languages.map((lang, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={lang}
                  onChange={(e) => {
                    const newList = [...formData.languages];
                    newList[idx] = e.target.value;
                    setFormData({ ...formData, languages: newList });
                  }}
                  placeholder="e.g. English"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem("languages", idx)}
                  className="text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {formData.languages.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full italic">No languages added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="border-white/5 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" /> Education History
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addItem("educations", { degree: "", institution: "", fieldOfStudy: "", description: "" })}
            className="h-8 px-2"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.educations.map((edu, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-4 relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem("educations", idx)}
                className="absolute top-2 right-2 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">Degree</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateItem("educations", idx, "degree", e.target.value)}
                    placeholder="e.g. MBBS, MD"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Institution</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateItem("educations", idx, "institution", e.target.value)}
                    placeholder="e.g. Harvard Medical School"
                  />
                </div>
              </div>
            </div>
          ))}
          {formData.educations.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No education records added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Working Hospitals */}
      <Card className="border-white/5 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Clinical Affiliations
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addItem("workingHospitals", { hospitalName: "", department: "", position: "", country: "", city: "" })}
            className="h-8 px-2"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Hospital
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.workingHospitals.map((hosp, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-4 relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem("workingHospitals", idx)}
                className="absolute top-2 right-2 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 col-span-full">
                  <Label className="text-xs">Hospital Name</Label>
                  <Input
                    value={hosp.hospitalName}
                    onChange={(e) => updateItem("workingHospitals", idx, "hospitalName", e.target.value)}
                    placeholder="e.g. Central Hospital"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Position</Label>
                  <Input
                    value={hosp.position}
                    onChange={(e) => updateItem("workingHospitals", idx, "position", e.target.value)}
                    placeholder="e.g. Senior Surgeon"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Department</Label>
                  <Input
                    value={hosp.department}
                    onChange={(e) => updateItem("workingHospitals", idx, "department", e.target.value)}
                    placeholder="e.g. Cardiology"
                  />
                </div>
              </div>
            </div>
          ))}
          {formData.workingHospitals.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No hospital records added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 sticky bottom-6 bg-background/80 backdrop-blur p-4 rounded-xl border shadow-lg">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
          className="gap-2"
        >
          <X className="w-4 h-4" /> Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="gap-2 min-w-[120px]"
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
