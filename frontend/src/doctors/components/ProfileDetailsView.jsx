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
      {/* Sidebar Info */}
      <div className="md:col-span-4 space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" /> 
              Professional Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender</p>
                <p className="text-sm font-medium capitalize">{profile.gender || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Experience</p>
                <p className="text-sm font-medium">{profile.experience || "0"}+ Years</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Information</p>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted text-muted-foreground">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Direct Line</p>
                  <p className="text-sm font-medium">{profile.contactNo || "Not provided"}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Languages className="w-3.5 h-3.5" /> Languages
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.languages?.length > 0 ? (
                  profile.languages.map((lang, idx) => (
                    <Badge key={idx} variant="secondary" className="font-normal">
                      {lang}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No languages added</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Info */}
      <div className="md:col-span-8 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">About Me</h3>
          </div>
          <Card className="shadow-sm border-none bg-muted/30">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">
                {profile.bio || 
                  <span className="italic">"Adding a professional bio helps patients understand your expertise and care philosophy. Click edit to share your professional story."</span>
                }
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <GraduationCap className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Education & Training</h3>
          </div>
          
          <div className="space-y-6">
            {profile.educations?.length > 0 ? (
              profile.educations.map((edu, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                    {idx !== profile.educations.length - 1 && (
                      <div className="w-px h-full bg-border mt-2" />
                    )}
                  </div>
                  
                  <div className="space-y-1 pb-4">
                    <h4 className="font-semibold text-base">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      {edu.institution}
                      {edu.fieldOfStudy && (
                        <>
                          <span>•</span>
                          <span>{edu.fieldOfStudy}</span>
                        </>
                      )}
                    </p>
                    {edu.description && (
                      <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No education details added yet.</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Clinical Affiliations</h3>
          </div>

          <div className="grid gap-4">
            {profile.workingHospitals?.length > 0 ? (
              profile.workingHospitals.map((hosp, idx) => (
                <Card key={idx} className="shadow-sm">
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-base">{hosp.hospitalName}</h4>
                        <p className="text-sm text-foreground">{hosp.position}</p>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <MapPin className="w-3 h-3" />
                        {hosp.city}, {hosp.country}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground w-fit">
                      <Briefcase className="w-4 h-4" />
                      <span>{hosp.department} Department</span>
                    </div>

                    {hosp.description && (
                      <>
                        <Separator className="mt-1" />
                        <p className="text-sm text-muted-foreground pt-1">
                          {hosp.description}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
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
