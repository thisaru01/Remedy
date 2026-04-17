import React, { useEffect, useState } from "react";
import { useDoctorPrescription } from "@/hooks/useDoctorPrescription";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, FileText, Loader2, AlertCircle, Calendar, Pill, Clock, Zap, AlertTriangle, Droplet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PrescriptionsTab({ appointmentId, appointment }) {
  const { prescription, loading, error, submitting, fetchPrescription, submitPrescription } = useDoctorPrescription(appointmentId);

  const [diagnosis, setDiagnosis] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [medications, setMedications] = useState([
    { name: "", dosage: "", frequency: "", duration: "", route: "", notes: "" }
  ]);

  useEffect(() => {
    fetchPrescription();
  }, [fetchPrescription]);

  const paymentSuccess = appointment?.paymentStatus === "success";

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading prescription data...
      </div>
    );
  }

  // View Mode
  if (prescription) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
          <FileText className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-800 font-semibold">Prescription Finalized</AlertTitle>
          <AlertDescription className="text-emerald-700">
            This prescription was securely finalized and issued on {new Date(prescription.issuedAt).toLocaleDateString()}.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-lg">Prescription Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Diagnosis Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Clinical Diagnosis
              </h4>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{prescription.diagnosis}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-600" />
                Medications
              </h4>
              <div className="space-y-4">
                {prescription.medications?.map((m, idx) => (
                  <div key={idx} className="border rounded-lg bg-gradient-to-br from-purple-50/50 via-card to-blue-50/30 hover:shadow-md transition-all">
                    <div className="p-5 space-y-4">
                      {/* Medication Name & Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-lg font-bold text-slate-900">{m.name}</div>
                          {m.route && (
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Droplet className="w-3 h-3" />
                              Route: <span className="font-medium">{m.route}</span>
                            </div>
                          )}
                        </div>
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 whitespace-nowrap">
                          #{idx + 1}
                        </Badge>
                      </div>

                      {/* Main Medication Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Dosage */}
                        <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
                            <Zap className="w-3.5 h-3.5 text-purple-600" />
                            Dosage
                          </div>
                          <div className="text-sm font-bold text-slate-900 font-mono">{m.dosage}</div>
                        </div>

                        {/* Frequency */}
                        <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            Frequency
                          </div>
                          <div className="text-sm font-bold text-slate-900">{m.frequency}</div>
                        </div>

                        {/* Duration */}
                        <div className="bg-white/60 rounded-lg p-3 border border-emerald-100">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            Duration
                          </div>
                          <div className="text-sm font-bold text-slate-900">{m.duration}</div>
                        </div>

                        {/* Status Badge */}
                        <div className="bg-white/60 rounded-lg p-3 border border-green-100">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
                            <FileText className="w-3.5 h-3.5 text-green-600" />
                            Status
                          </div>
                          <div className="text-sm font-bold text-green-700">Active</div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {m.notes && (
                        <>
                          <Separator className="my-1" />
                          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3">
                            <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-2">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Special Instructions
                            </div>
                            <p className="text-sm text-amber-900 leading-relaxed">{m.notes}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {prescription.advice && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Medical Advice & Instructions
                </h4>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{prescription.advice}</p>
                </div>
              </div>
            )}

            {/* Follow-up Section */}
            {prescription.followUpDate && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-emerald-50 border border-cyan-200 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cyan-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recommended Follow-up</h4>
                    <p className="text-base font-bold text-slate-900 mt-1">{new Date(prescription.followUpDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form Mode
  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "", route: "", notes: "" }]);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitPrescription({ diagnosis, advice, followUpDate, medications });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {!paymentSuccess && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Blocked</AlertTitle>
          <AlertDescription>
            You cannot issue a prescription because the payment for this appointment is not marked as successful.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-4 border-b bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Issue Prescription
          </CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Fill out the details carefully. Once submitted, the prescription is finalized and cannot be edited.
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8 bg-card">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Diagnosis Overview <span className="text-red-500">*</span></label>
              <Textarea 
                required 
                placeholder="Patient's diagnosis and medical impression..."
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                disabled={!paymentSuccess || submitting}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-semibold">Medications <span className="text-red-500">*</span></h3>
            </div>
            
            <div className="space-y-4">
              {medications.map((med, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-background/50 space-y-4 relative group hover:border-primary/50 transition-colors">
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeMedication(idx)}
                      disabled={!paymentSuccess || submitting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medicine Name</label>
                      <Input 
                        required 
                        placeholder="e.g. Paracetamol" 
                        value={med.name} 
                        onChange={(e) => handleChange(idx, 'name', e.target.value)}
                        disabled={!paymentSuccess || submitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dosage</label>
                      <Input 
                        required 
                        placeholder="e.g. 500mg" 
                        value={med.dosage} 
                        onChange={(e) => handleChange(idx, 'dosage', e.target.value)}
                        disabled={!paymentSuccess || submitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Frequency</label>
                      <Input 
                        required 
                        placeholder="e.g. 1-0-1 (Twice daily)" 
                        value={med.frequency} 
                        onChange={(e) => handleChange(idx, 'frequency', e.target.value)}
                        disabled={!paymentSuccess || submitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</label>
                      <Input 
                        required 
                        placeholder="e.g. 5 Days" 
                        value={med.duration} 
                        onChange={(e) => handleChange(idx, 'duration', e.target.value)}
                        disabled={!paymentSuccess || submitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Route <span className="opacity-50">(Optional)</span></label>
                      <Input 
                        placeholder="e.g. Oral" 
                        value={med.route} 
                        onChange={(e) => handleChange(idx, 'route', e.target.value)}
                        disabled={!paymentSuccess || submitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes <span className="opacity-50">(Optional)</span></label>
                      <Input 
                        placeholder="e.g. After meals" 
                        value={med.notes} 
                        onChange={(e) => handleChange(idx, 'notes', e.target.value)}
                        disabled={!paymentSuccess || submitting}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button 
                type="button" 
                variant="outline" 
                onClick={addMedication} 
                className="w-full border-dashed gap-2 text-muted-foreground hover:text-primary transition-colors"
                disabled={!paymentSuccess || submitting}
              >
                <PlusCircle className="w-4 h-4" /> Add Another Medication
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-semibold">General Advice / Remarks <span className="opacity-50 text-muted-foreground font-normal">(Optional)</span></label>
              <Textarea 
                placeholder="Any dietary constraints, rest advice, etc."
                value={advice}
                onChange={e => setAdvice(e.target.value)}
                disabled={!paymentSuccess || submitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Recommended Follow-up Date <span className="opacity-50 text-muted-foreground font-normal">(Optional)</span></label>
              <Input 
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                disabled={!paymentSuccess || submitting}
              />
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              className="gap-2 w-full sm:w-auto"
              disabled={!paymentSuccess || submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {submitting ? "Finalizing Prescription..." : "Finalize & Issue Prescription"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
