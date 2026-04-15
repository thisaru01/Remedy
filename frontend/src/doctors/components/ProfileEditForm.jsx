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

export function ProfileEditForm({ profile, onSave, onCancel, saving, error }) {
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
    
    // Bio validation
    const bioTrimmed = formData.bio?.trim() || "";
    if (!bioTrimmed) {
      newErrors.bio = "Bio is required";
    } else if (bioTrimmed.length < 20) {
      newErrors.bio = "Bio must be at least 20 characters";
    } else if (bioTrimmed.length > 1000) {
      newErrors.bio = "Bio cannot exceed 1000 characters";
    }
    
    // Contact No validation
    const phoneRegex = /^\+?[\d\s\-().]{8,20}$/;
    if (!formData.contactNo) {
      newErrors.contactNo = "Contact number is required";
    } else if (!phoneRegex.test(formData.contactNo.trim())) {
      newErrors.contactNo = "Invalid phone number format (8-20 digits)";
    } else if (formData.contactNo.replace(/\D/g, "").length < 8) {
      newErrors.contactNo = "Phone must contain at least 8 digits";
    }

    // Experience validation
    if (formData.experience === "" || formData.experience === null) {
      newErrors.experience = "Experience is required";
    } else {
      const expNum = Number(formData.experience);
      if (isNaN(expNum)) {
        newErrors.experience = "Experience must be a number";
      } else if (expNum < 0) {
        newErrors.experience = "Experience cannot be negative";
      } else if (expNum > 70) {
        newErrors.experience = "Experience cannot exceed 70 years";
      } else if (!Number.isInteger(expNum)) {
        newErrors.experience = "Experience must be a whole number";
      }
    }

    // Languages validation
    const validLanguages = formData.languages.filter(lang => lang.trim());
    if (validLanguages.length === 0) {
      newErrors.languages = "At least one language must be added";
    } else {
      const emptyLanguages = formData.languages.some(lang => !lang.trim());
      if (emptyLanguages) {
        newErrors.languages = "Language entries cannot be empty";
      }
      // Check for duplicates (case-insensitive)
      const langSet = new Set(formData.languages.map(l => l.trim().toLowerCase()));
      if (langSet.size !== formData.languages.length) {
        newErrors.languages = "Duplicate languages are not allowed";
      }
      // Check for valid language names
      const invalidLangs = formData.languages.some(lang => {
        const trimmed = lang.trim();
        return trimmed.length < 2 || trimmed.length > 50 || /^\d+$/.test(trimmed);
      });
      if (invalidLangs) {
        newErrors.languages = "Language names must be 2-50 characters and not purely numeric";
      }
    }

    // Educations validation
    if (formData.educations.length === 0) {
      newErrors.educations = "At least one education record must be added";
    } else {
      formData.educations.forEach((edu, idx) => {
        const eduErrors = [];
        
        if (!edu.degree?.trim()) {
          eduErrors.push("Degree is required");
        } else if (edu.degree.trim().length < 2 || edu.degree.trim().length > 100) {
          eduErrors.push("Degree must be 2-100 characters");
        }
        
        if (!edu.institution?.trim()) {
          eduErrors.push("Institution is required");
        } else if (edu.institution.trim().length < 3 || edu.institution.trim().length > 150) {
          eduErrors.push("Institution must be 3-150 characters");
        }
        
        if (edu.fieldOfStudy?.trim() && (edu.fieldOfStudy.trim().length < 2 || edu.fieldOfStudy.trim().length > 100)) {
          eduErrors.push("Field of study must be 2-100 characters");
        }
        
        if (edu.description?.trim() && edu.description.trim().length > 500) {
          eduErrors.push("Description cannot exceed 500 characters");
        }
        
        if (eduErrors.length > 0) {
          if (!newErrors.educations) newErrors.educations = [];
          newErrors.educations[idx] = eduErrors.join("; ");
        }
      });
    }

    // Working Hospitals validation
    if (formData.workingHospitals.length === 0) {
      newErrors.workingHospitals = "At least one hospital affiliation must be added";
    } else {
      formData.workingHospitals.forEach((hosp, idx) => {
        const hospErrors = [];
        
        if (!hosp.hospitalName?.trim()) {
          hospErrors.push("Hospital name is required");
        } else if (hosp.hospitalName.trim().length < 2 || hosp.hospitalName.trim().length > 150) {
          hospErrors.push("Hospital name must be 2-150 characters");
        }
        
        if (!hosp.position?.trim()) {
          hospErrors.push("Position is required");
        } else if (hosp.position.trim().length < 2 || hosp.position.trim().length > 100) {
          hospErrors.push("Position must be 2-100 characters");
        }
        
        if (!hosp.department?.trim()) {
          hospErrors.push("Department is required");
        } else if (hosp.department.trim().length < 2 || hosp.department.trim().length > 100) {
          hospErrors.push("Department must be 2-100 characters");
        }
        
        if (!hosp.city?.trim()) {
          hospErrors.push("City is required");
        } else if (hosp.city.trim().length < 2 || hosp.city.trim().length > 100) {
          hospErrors.push("City must be 2-100 characters");
        }
        
        if (!hosp.country?.trim()) {
          hospErrors.push("Country is required");
        } else if (hosp.country.trim().length < 2 || hosp.country.trim().length > 100) {
          hospErrors.push("Country must be 2-100 characters");
        }
        
        if (hosp.description?.trim() && hosp.description.trim().length > 500) {
          hospErrors.push("Description cannot exceed 500 characters");
        }
        
        if (hospErrors.length > 0) {
          if (!newErrors.workingHospitals) newErrors.workingHospitals = [];
          newErrors.workingHospitals[idx] = hospErrors.join("; ");
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Auto-trim whitespace for certain fields
    if (["contactNo", "specialty", "gender"].includes(name)) {
      processedValue = value.trim();
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
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
    
    // Trim all string fields before validation
    const trimmedData = {
      specialty: formData.specialty.trim(),
      contactNo: formData.contactNo.trim(),
      gender: formData.gender.trim(),
      experience: formData.experience,
      bio: formData.bio.trim(),
      languages: formData.languages.map(lang => lang.trim()).filter(lang => lang),
      educations: formData.educations.map(edu => ({
        degree: edu.degree.trim(),
        institution: edu.institution.trim(),
        fieldOfStudy: edu.fieldOfStudy?.trim() || "",
        description: edu.description?.trim() || "",
      })),
      workingHospitals: formData.workingHospitals.map(hosp => ({
        hospitalName: hosp.hospitalName.trim(),
        department: hosp.department.trim(),
        position: hosp.position.trim(),
        country: hosp.country.trim(),
        city: hosp.city.trim(),
        description: hosp.description?.trim() || "",
      })),
    };

    // Validate trimmed data
    setFormData(trimmedData);
    
    // Run validation on trimmed data
    const trimmedFormData = { ...formData }; 
    Object.assign(trimmedFormData, trimmedData);
    
    // Update form state with trimmed data before validation
    setFormData(trimmedData);
    
    if (validateForm()) {
      onSave(trimmedData);
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
                    min="0"
                    max="70"
                    value={formData.experience}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only numbers 0-70
                      if (value === "" || (Number(value) >= 0 && Number(value) <= 70)) {
                        handleChange(e);
                      }
                    }}
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
              <div className="flex justify-between items-center mb-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">A brief professional summary</Label>
                <span className={cn(
                  "text-[9px] font-semibold",
                  formData.bio.length < 20 ? "text-rose-500" : formData.bio.length > 900 ? "text-amber-500" : "text-green-500/60"
                )}>
                  {formData.bio.length}/1000
                </span>
              </div>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={6}
                maxLength="1000"
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
                        // Only allow letters, spaces, and hyphens
                        newList[idx] = e.target.value.replace(/[^a-zA-Z\s\-]/g, "");
                        setFormData({ ...formData, languages: newList });
                        // Clear error on this language if being edited
                        if (errors.languages) {
                          setErrors(prev => {
                            const updated = { ...prev };
                            delete updated.languages;
                            return updated;
                          });
                        }
                      }}
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-lg h-9 text-xs",
                        !lang.trim() && errors.languages && "border-rose-500/50 bg-rose-500/5"
                      )}
                      placeholder="e.g. English"
                      maxLength="50"
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
                  {lang && (
                    <span className="text-[9px] text-muted-foreground/50 px-1">
                      {lang.length}/50 characters
                    </span>
                  )}
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
                      onChange={(e) => updateItem("educations", idx, "degree", e.target.value.slice(0, 100))}
                      placeholder="e.g. MBBS, MD"
                      maxLength="100"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !edu.degree && errors.educations?.[idx] && "border-rose-500/50"
                      )}
                    />
                    {edu.degree && (
                      <span className="text-[9px] text-muted-foreground/50">{edu.degree.length}/100</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateItem("educations", idx, "institution", e.target.value.slice(0, 150))}
                      placeholder="e.g. Harvard Medical School"
                      maxLength="150"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !edu.institution && errors.educations?.[idx] && "border-rose-500/50"
                      )}
                    />
                    {edu.institution && (
                      <span className="text-[9px] text-muted-foreground/50">{edu.institution.length}/150</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Field of Study</Label>
                  <Input
                    value={edu.fieldOfStudy}
                    onChange={(e) => updateItem("educations", idx, "fieldOfStudy", e.target.value.slice(0, 100))}
                    placeholder="e.g. Cardiovascular Medicine"
                    maxLength="100"
                    className="bg-white/[0.02] border-white/10 rounded-xl"
                  />
                  {edu.fieldOfStudy && (
                    <span className="text-[9px] text-muted-foreground/50">{edu.fieldOfStudy.length}/100</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => updateItem("educations", idx, "description", e.target.value.slice(0, 500))}
                    placeholder="Describe your training and achievements..."
                    maxLength="500"
                    className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm shadow-xs transition-all placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 leading-relaxed"
                  />
                  {edu.description && (
                    <span className="text-[9px] text-muted-foreground/50 text-right block">
                      {edu.description.length}/500 characters
                    </span>
                  )}
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
                    onChange={(e) => updateItem("workingHospitals", idx, "hospitalName", e.target.value.slice(0, 150))}
                    placeholder="e.g. Central Hospital"
                    maxLength="150"
                    className={cn(
                      "bg-white/[0.02] border-white/10 rounded-xl h-11",
                      !hosp.hospitalName && errors.workingHospitals?.[idx] && "border-rose-500/50"
                    )}
                  />
                  {hosp.hospitalName && (
                    <span className="text-[9px] text-muted-foreground/50">{hosp.hospitalName.length}/150</span>
                  )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Position / Role</Label>
                    <Input
                      value={hosp.position}
                      onChange={(e) => updateItem("workingHospitals", idx, "position", e.target.value.slice(0, 100))}
                      placeholder="e.g. Senior Surgeon"
                      maxLength="100"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !hosp.position && errors.workingHospitals?.[idx] && "border-rose-500/50"
                      )}
                    />
                    {hosp.position && (
                      <span className="text-[9px] text-muted-foreground/50">{hosp.position.length}/100</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Department</Label>
                    <Input
                      value={hosp.department}
                      onChange={(e) => updateItem("workingHospitals", idx, "department", e.target.value.slice(0, 100))}
                      placeholder="e.g. Cardiology"
                      maxLength="100"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !hosp.department && errors.workingHospitals?.[idx] && "border-rose-500/50"
                      )}
                    />
                    {hosp.department && (
                      <span className="text-[9px] text-muted-foreground/50">{hosp.department.length}/100</span>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-white/5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">City</Label>
                    <Input
                      value={hosp.city}
                      onChange={(e) => updateItem("workingHospitals", idx, "city", e.target.value.slice(0, 100))}
                      placeholder="e.g. New York"
                      maxLength="100"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !hosp.city && errors.workingHospitals?.[idx] && "border-rose-500/50"
                      )}
                    />
                    {hosp.city && (
                      <span className="text-[9px] text-muted-foreground/50">{hosp.city.length}/100</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Country</Label>
                    <Input
                      value={hosp.country}
                      onChange={(e) => updateItem("workingHospitals", idx, "country", e.target.value.slice(0, 100))}
                      placeholder="e.g. USA"
                      maxLength="100"
                      className={cn(
                        "bg-white/[0.02] border-white/10 rounded-xl",
                        !hosp.country && errors.workingHospitals?.[idx] && "border-rose-500/50"
                      )}
                    />
                    {hosp.country && (
                      <span className="text-[9px] text-muted-foreground/50">{hosp.country.length}/100</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Hospital Description / Responsibilities</Label>
                  <textarea
                    value={hosp.description}
                    onChange={(e) => updateItem("workingHospitals", idx, "description", e.target.value.slice(0, 500))}
                    placeholder="Describe your role and responsibilities..."
                    maxLength="500"
                    className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm shadow-xs transition-all placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 leading-relaxed"
                  />
                  {hosp.description && (
                    <span className="text-[9px] text-muted-foreground/50 text-right block">
                      {hosp.description.length}/500 characters
                    </span>
                  )}
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
