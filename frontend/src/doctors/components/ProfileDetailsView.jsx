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
    <div className="grid gap-6 md:grid-cols-3">
      {/* Sidebar Info */}
      <div className="space-y-6">
        <Card className="border-white/5 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase text-[10px] font-bold">Gender</p>
              <p className="capitalize">{profile.gender || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase text-[10px] font-bold">Contact No</p>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <p>{profile.contactNo || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Languages className="w-4 h-4" /> Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.languages?.length > 0 ? (
                profile.languages.map((lang, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3">
                    {lang}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No languages added</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Info */}
      <div className="md:col-span-2 space-y-6">
        <Card className="border-white/5 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" /> Biography
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap italic">
              {profile.bio || "No biography provided yet. Add a professional bio to help patients get to know you."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.educations?.length > 0 ? (
              profile.educations.map((edu, idx) => (
                <div key={idx} className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:bg-primary before:rounded-full after:absolute after:left-[3px] after:top-5 after:bottom-[-20px] after:w-[2px] after:bg-white/5 last:after:hidden">
                  <h4 className="font-semibold">{edu.degree}</h4>
                  <p className="text-sm font-medium text-primary">{edu.institution}</p>
                  {edu.fieldOfStudy && (
                    <p className="text-xs text-muted-foreground mt-1">Field of Study: {edu.fieldOfStudy}</p>
                  )}
                  {edu.description && (
                    <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No education details added</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Working Hospitals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.workingHospitals?.length > 0 ? (
              profile.workingHospitals.map((hosp, idx) => (
                <div key={idx} className="flex flex-col gap-1 p-4 rounded-lg bg-white/[0.02] border border-white/5 ml-6 relative before:absolute before:left-[-24px] before:top-4 before:w-4 before:h-[2px] before:bg-white/5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-primary">{hosp.hospitalName}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3" />
                      {hosp.city}, {hosp.country}
                    </div>
                  </div>
                  <p className="text-sm font-medium">{hosp.position}</p>
                  <p className="text-xs text-muted-foreground">{hosp.department} Department</p>
                  {hosp.description && (
                    <p className="text-sm text-muted-foreground mt-2 border-t border-white/5 pt-2">{hosp.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hospital details added</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
