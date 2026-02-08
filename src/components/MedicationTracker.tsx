
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { MedicationPrescription } from '../types';
import { toast } from "sonner";

interface MedicationTrackerProps {
    prescriptions: MedicationPrescription[];
    onLogMedication: (medicationName: string) => Promise<void>;
    isSubmitting?: boolean;
}

const MedicationTracker: React.FC<MedicationTrackerProps> = ({ prescriptions, onLogMedication, isSubmitting }) => {
    const [logging, setLogging] = useState<string | null>(null);

    const handleLog = async (medName: string) => {
        if (isSubmitting) return;
        setLogging(medName);
        try {
            await onLogMedication(medName);
            toast.success(`Logged ${medName} as taken!`, {
                description: new Date().toLocaleTimeString(),
                icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
            });
        } catch (error) {
            toast.error("Failed to log medication. Please try again.");
        } finally {
            setLogging(null);
        }
    };

    if (prescriptions.length === 0) {
        return (
            <Card className="border-dashed border-primary/20 bg-primary/[0.02]">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <Pill className="h-10 w-10 text-primary opacity-40" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-primary/80">No Medications Prescribed</h3>
                        <p className="text-sm text-muted-foreground max-w-[250px]">
                            If you have been prescribed medication, it will appear here for easy logging.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((med) => (
                    <Card key={med.medicationName} className="border-primary/10 hover:border-primary/30 transition-all group">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <Pill className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold">{med.medicationName}</CardTitle>
                                        {med.dosage && (
                                            <CardDescription className="font-medium text-primary/70">{med.dosage}</CardDescription>
                                        )}
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest bg-green-500/5 text-green-600 border-green-500/20">
                                    {med.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => handleLog(med.medicationName)}
                                disabled={logging === med.medicationName}
                                className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border-primary/20 font-bold transition-all"
                            >
                                {logging === med.medicationName ? (
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 animate-spin" /> Recording...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-foreground group-hover:text-white">
                                        <CheckCircle2 className="h-4 w-4" /> Mark as Taken
                                    </span>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Clinical Note</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                        Please follow your provider's instructions exactly. If you experience unexpected side effects, log them in your Emotional Journal and contact your therapist immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MedicationTracker;
