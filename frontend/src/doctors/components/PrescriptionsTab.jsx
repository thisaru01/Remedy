import React, { useEffect, useState } from "react";
import { useDoctorPrescription } from "@/hooks/useDoctorPrescription";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, FileText, Loader2, AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Diagnosis</h4>
              <p className="text-base font-medium">{prescription.diagnosis}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Medications</h4>
              <div className="grid gap-3">
                {prescription.medications?.map((m, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-card shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-lg text-primary">{m.name}</div>
                      <div className="text-sm text-foreground space-x-2 mt-1">
                        <span className="font-medium bg-muted px-2 py-0.5 rounded">{m.dosage}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{m.frequency}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{m.duration}</span>
                        {m.route && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="italic">{m.route}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {m.notes && (
                      <div className="bg-muted/50 p-2 rounded text-sm text-muted-foreground max-w-xs w-full text-right md:text-left self-start">
                        {m.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {prescription.advice && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Medical Advice</h4>
                <p className="whitespace-pre-wrap">{prescription.advice}</p>
              </div>
            )}

            {prescription.followUpDate && (
              <div className="flex items-center gap-2 pt-4 border-t text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Recommended Follow-up:</span>
                <span className="text-foreground">{new Date(prescription.followUpDate).toLocaleDateString()}</span>
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
