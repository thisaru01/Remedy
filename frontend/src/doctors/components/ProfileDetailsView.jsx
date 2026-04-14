import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, 
  GraduationCap, 
  Languages, 
  Phone, 
  User, 
  FileText,
  MapPin,
  Building2
} from "lucide-react";

export function ProfileDetailsView({ profile }) {
  if (!profile) return null;

  return (
    <div className="grid gap-8 md:grid-cols-12 items-start">
      {/* Expanded Sidebar Info */}
      <div className="md:col-span-4 space-y-6">
        <Card className="overflow-hidden border-white/10 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-md shadow-sm">
          <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Professional Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Gender</p>
                <p className="text-sm font-semibold capitalize">{profile.gender || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Experience</p>
                <p className="text-sm font-semibold">{profile.experience || "0"}+ Years</p>
              </div>
            </div>
            
            <Separator className="bg-white/5" />
            
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Contact Information</p>
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Direct Line</p>
                  <p className="text-sm font-bold tracking-wide">{profile.contactNo || "Not provided"}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-white/5" />

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-2">
                <Languages className="w-3 h-3 text-primary" /> Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.languages?.length > 0 ? (
                  profile.languages.map((lang, idx) => (
                    <Badge key={idx} variant="outline" className="px-2 py-0 bg-white/5 border-white/10 text-[11px] font-medium">
                      {lang}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No languages added</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats or Additional Info could go here */}
      </div>

      {/* Main Info */}
      <div className="md:col-span-8 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground/60 px-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">About Me</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="relative p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors duration-500">
            <p className="text-muted-foreground leading-relaxed text-lg font-light italic">
              "{profile.bio || "Adding a professional bio helps patients understand your expertise and care philosophy. Click edit to share your professional story."}"
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-muted-foreground/60 px-1">
            <GraduationCap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Education & Training</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          
          <div className="space-y-4">
            {profile.educations?.length > 0 ? (
              profile.educations.map((edu, idx) => (
                <div key={idx} className="group relative pl-8 py-2">
                  <div className="absolute left-0 top-3 w-3 h-3 rounded-full border-2 border-primary bg-background group-hover:scale-125 transition-transform duration-300" />
                  <div className="absolute left-[5px] top-7 bottom-[-16px] w-[2px] bg-white/5 group-last:hidden" />
                  
                  <div className="space-y-1">
                    <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{edu.degree}</h4>
                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      {edu.institution}
                      {edu.fieldOfStudy && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="font-medium opacity-80">{edu.fieldOfStudy}</span>
                        </>
                      )}
                    </p>
                    {edu.description && (
                      <p className="text-sm text-muted-foreground/70 mt-2 max-w-2xl leading-relaxed">{edu.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic px-8">No education details added yet.</p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-muted-foreground/60 px-1">
            <Building2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Clinical Affiliations</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid gap-4">
            {profile.workingHospitals?.length > 0 ? (
              profile.workingHospitals.map((hosp, idx) => (
                <div key={idx} className="group flex flex-col gap-3 p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="font-bold text-primary text-base group-hover:scale-[1.01] origin-left transition-transform">{hosp.hospitalName}</h4>
                      <p className="text-sm font-medium">{hosp.position}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-full self-start">
                      <MapPin className="w-3 h-3 text-primary" />
                      {hosp.city}, {hosp.country}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 py-1 px-3 rounded-md bg-primary/5 w-fit">
                    <Briefcase className="w-3 h-3 text-primary" />
                    <span className="text-xs font-bold text-primary/80 tracking-wide uppercase">{hosp.department} Department</span>
                  </div>

                  {hosp.description && (
                    <p className="text-sm text-muted-foreground/70 border-t border-white/5 pt-3 mt-1 italic leading-relaxed">
                      {hosp.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No hospital details added yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
