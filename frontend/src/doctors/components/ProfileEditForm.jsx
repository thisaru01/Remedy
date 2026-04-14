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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Building2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    experience: profile?.experience || "",
    bio: profile?.bio || "",
    languages: profile?.languages || [],
    educations: profile?.educations || [],
    workingHospitals: profile?.workingHospitals || [],
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Basic Fields
    if (!formData.specialty) newErrors.specialty = "Specialty is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.bio || formData.bio.length < 20) {
      newErrors.bio = "Bio must be at least 20 characters";
    }
    
    // Contact No validation
    const phoneRegex = /^\+?[\d\s-]{8,20}$/;
    if (!formData.contactNo) {
      newErrors.contactNo = "Contact number is required";
    } else if (!phoneRegex.test(formData.contactNo)) {
      newErrors.contactNo = "Invalid phone number format";
    }

    // Experience validation
    if (formData.experience === "" || formData.experience === null) {
      newErrors.experience = "Experience is required";
    } else if (Number(formData.experience) < 0) {
      newErrors.experience = "Experience cannot be negative";
    }

    // Languages
    if (formData.languages.some(lang => !lang.trim())) {
      newErrors.languages = "Language entries cannot be empty";
    }

    // Educations
    formData.educations.forEach((edu, idx) => {
      if (!edu.degree || !edu.institution) {
        if (!newErrors.educations) newErrors.educations = [];
        newErrors.educations[idx] = "Degree and Institution are required";
      }
    });

    // Working Hospitals
    formData.workingHospitals.forEach((hosp, idx) => {
      if (!hosp.hospitalName || !hosp.position || !hosp.department || !hosp.city || !hosp.country) {
        if (!newErrors.workingHospitals) newErrors.workingHospitals = [];
        newErrors.workingHospitals[idx] = "All hospital location and position details are required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const addItem = (listKey, newItem) => {
    setFormData((prev) => ({ ...prev, [listKey]: [...prev[listKey], newItem] }));
  };

  const removeItem = (listKey, index) => {
    setFormData((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
    // Also remove from errors if it exists
    if (errors[listKey]?.[index]) {
      setErrors(prev => {
        const updated = { ...prev };
        if (Array.isArray(updated[listKey])) {
          updated[listKey] = updated[listKey].filter((_, i) => i !== index);
        }
        return updated;
      });
    }
  };

  const updateItem = (listKey, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [listKey]: prev[listKey].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    // Clear list item error if it exists
    if (errors[listKey]?.[index]) {
      setErrors(prev => {
        const updated = { ...prev };
        if (Array.isArray(updated[listKey])) {
          updated[listKey][index] = null;
        }
        return updated;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    } else {
      toast.error("Please correct the errors in the form before saving.");
    }
  };

  const ErrorComponent = ({ message }) => (
    <div className="flex items-center gap-1 mt-1.5 text-rose-500 animate-in fade-in slide-in-from-top-1 duration-300">
      <AlertCircle className="w-3 h-3" />
      <span className="text-[10px] font-bold uppercase tracking-wider leading-none">{message}</span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Settings */}
        <Card className={cn(
          "border-white/10 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-md shadow-sm rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300",
          (errors.specialty || errors.gender || errors.experience || errors.contactNo) && "border-rose-500/30"
        )}>
          <CardHeader className="bg-white/[0.02] border-b border-white/5 py-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5" /> Professional Basics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Specialty</Label>
              <Select
                value={formData.specialty}
                onValueChange={(v) => handleSelectChange("specialty", v)}
              >
                <SelectTrigger className={cn(
                  "bg-white/[0.02] border-white/10 rounded-xl h-11",
                  errors.specialty && "border-rose-500/50 bg-rose-500/5 ring-rose-500/20"
                )}>
                  <SelectValue placeholder="Select Specialty" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s} className="focus:bg-primary/20 focus:text-primary">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialty && <ErrorComponent message={errors.specialty} />}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => handleSelectChange("gender", v)}
                >
                  <SelectTrigger className={cn(
                    "bg-white/[0.02] border-white/10 rounded-xl h-11",
                    errors.gender && "border-rose-500/50 bg-rose-500/5"
                  )}>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    <SelectItem value="male" className="focus:bg-primary/20 focus:text-primary">Male</SelectItem>
                    <SelectItem value="female" className="focus:bg-primary/20 focus:text-primary">Female</SelectItem>
                    <SelectItem value="other" className="focus:bg-primary/20 focus:text-primary">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <ErrorComponent message={errors.gender} />}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Experience (Years)</Label>
                <div className="relative group">
                  <Plus className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    className={cn(
                      "pl-10 h-11 bg-white/[0.02] border-white/10 rounded-xl focus:ring-primary/20 focus:border-primary/40",
                      errors.experience && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500/50 focus:ring-rose-500/10"
                    )}
                  />
                </div>
                {errors.experience && <ErrorComponent message={errors.experience} />}
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Contact Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    className={cn(
                      "pl-10 h-11 bg-white/[0.02] border-white/10 rounded-xl focus:ring-primary/20 focus:border-primary/40",
                      errors.contactNo && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500/50 focus:ring-rose-500/10"
                    )}
                  />
                </div>
                {errors.contactNo && <ErrorComponent message={errors.contactNo} />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card className={cn(
          "border-white/10 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-md shadow-sm rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300",
          errors.bio && "border-rose-500/30"
        )}>
          <CardHeader className="bg-white/[0.02] border-b border-white/5 py-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Type className="w-3.5 h-3.5" /> Biography
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">A brief professional summary</Label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={6}
                className={cn(
                  "flex w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm shadow-xs transition-all placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 min-h-[160px] leading-relaxed",
                  errors.bio && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500/50 focus:ring-rose-500/10"
                )}
                placeholder="Write about your expertise, philosophy of care, and achievements..."
              />
              {errors.bio && <ErrorComponent message={errors.bio} />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Experience Sections */}
      <div className="grid gap-6">
        {/* Languages */}
        <Card className={cn(
          "border-white/10 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-md shadow-sm rounded-2xl overflow-hidden",
          errors.languages && "border-rose-500/30"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-white/[0.02] border-b border-white/5 py-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> Languages
            </CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addItem("languages", "")}
              className="h-8 px-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold text-[10px] uppercase tracking-wider"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Language
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-4">
              {formData.languages.map((lang, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex gap-2 group">
                    <Input
                      value={lang}
                      onChange={(e) => {
                        const newList = [...formData.languages];
                        newList[idx] = e.target.value;
                        setFormData({ ...formData, languages: newList });
                      }}
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-lg h-9 text-xs",
                        !lang.trim() && errors.languages && "border-rose-500/50 bg-rose-500/5"
                      )}
                      placeholder="e.g. English"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem("languages", idx)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 shrink-0 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {formData.languages.length === 0 && (
                <p className="text-xs text-muted-foreground col-span-full italic py-2">No languages added yet.</p>
              )}
            </div>
            {errors.languages && <ErrorComponent message={errors.languages} />}
          </CardContent>
        </Card>

        {/* Education */}
        <Card className={cn(
          "border-white/10 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-md shadow-sm rounded-2xl overflow-hidden",
          errors.educations && "border-rose-500/30"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-white/[0.02] border-b border-white/5 py-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" /> Education & Training
            </CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addItem("educations", { degree: "", institution: "", fieldOfStudy: "", description: "" })}
              className="h-8 px-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold text-[10px] uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Record
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {formData.educations.map((edu, idx) => (
              <div key={idx} className={cn(
                "group p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4 relative hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300",
                errors.educations?.[idx] && "border-rose-500/20 bg-rose-500/[0.01]"
              )}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem("educations", idx)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                {errors.educations?.[idx] && <ErrorComponent message={errors.educations[idx]} />}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Degree / Qualification</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateItem("educations", idx, "degree", e.target.value)}
                      placeholder="e.g. MBBS, MD"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !edu.degree && errors.educations?.[idx] && "border-rose-500/50"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateItem("educations", idx, "institution", e.target.value)}
                      placeholder="e.g. Harvard Medical School"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !edu.institution && errors.educations?.[idx] && "border-rose-500/50"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Field of Study</Label>
                  <Input
                    value={edu.fieldOfStudy}
                    onChange={(e) => updateItem("educations", idx, "fieldOfStudy", e.target.value)}
                    placeholder="e.g. Cardiovascular Medicine"
                    className="bg-white/[0.02] border-white/10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => updateItem("educations", idx, "description", e.target.value)}
                    placeholder="Describe your training and achievements..."
                    className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm shadow-xs transition-all placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 leading-relaxed"
                  />
                </div>
              </div>
            ))}
            {formData.educations.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-4 text-center">No education records added yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Working Hospitals */}
        <Card className={cn(
          "border-white/10 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-md shadow-sm rounded-2xl overflow-hidden",
          errors.workingHospitals && "border-rose-500/30"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-white/[0.02] border-b border-white/5 py-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> Clinical Affiliations
            </CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addItem("workingHospitals", { hospitalName: "", department: "", position: "", country: "", city: "" })}
              className="h-8 px-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold text-[10px] uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Hospital
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {formData.workingHospitals.map((hosp, idx) => (
              <div key={idx} className={cn(
                "group p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-5 relative hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300",
                errors.workingHospitals?.[idx] && "border-rose-500/20 bg-rose-500/[0.01]"
              )}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem("workingHospitals", idx)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                {errors.workingHospitals?.[idx] && <ErrorComponent message={errors.workingHospitals[idx]} />}
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Hospital Name</Label>
                  <Input
                    value={hosp.hospitalName}
                    onChange={(e) => updateItem("workingHospitals", idx, "hospitalName", e.target.value)}
                    placeholder="e.g. Central Hospital"
                    className={cn(
                      "bg-white/[0.02] border-white/10 rounded-xl h-11",
                      !hosp.hospitalName && errors.workingHospitals?.[idx] && "border-rose-500/50"
                    )}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Position / Role</Label>
                    <Input
                      value={hosp.position}
                      onChange={(e) => updateItem("workingHospitals", idx, "position", e.target.value)}
                      placeholder="e.g. Senior Surgeon"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !hosp.position && errors.workingHospitals?.[idx] && "border-rose-500/50"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Department</Label>
                    <Input
                      value={hosp.department}
                      onChange={(e) => updateItem("workingHospitals", idx, "department", e.target.value)}
                      placeholder="e.g. Cardiology"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !hosp.department && errors.workingHospitals?.[idx] && "border-rose-500/50"
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-white/5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">City</Label>
                    <Input
                      value={hosp.city}
                      onChange={(e) => updateItem("workingHospitals", idx, "city", e.target.value)}
                      placeholder="e.g. New York"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !hosp.city && errors.workingHospitals?.[idx] && "border-rose-500/50"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Country</Label>
                    <Input
                      value={hosp.country}
                      onChange={(e) => updateItem("workingHospitals", idx, "country", e.target.value)}
                      placeholder="e.g. USA"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !hosp.country && errors.workingHospitals?.[idx] && "border-rose-500/50"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Hospital Description / Responsibilities</Label>
                  <textarea
                    value={hosp.description}
                    onChange={(e) => updateItem("workingHospitals", idx, "description", e.target.value)}
                    placeholder="Describe your role and responsibilities..."
                    className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm shadow-xs transition-all placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 leading-relaxed"
                  />
                </div>
              </div>
            ))}
            {formData.workingHospitals.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-4 text-center">No hospital records added yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 sticky bottom-6 bg-background/80 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.3)] z-50">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
          className="px-6 rounded-xl border-white/10 hover:bg-white/5 font-semibold transition-all"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="relative px-10 rounded-xl font-bold bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all min-w-[140px]"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Profile
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
