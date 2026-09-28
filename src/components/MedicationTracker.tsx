
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, CheckCircle2, AlertCircle, Clock, History } from 'lucide-react';
import { MedicationPrescription, MedicationLog } from '../types';
import { toast } from "sonner";
import { format } from 'date-fns';

interface MedicationTrackerProps {
    prescriptions: MedicationPrescription[];
    medLogs: MedicationLog[];
    onLogMedication: (medicationName: string) => Promise<void>;
    isSubmitting?: boolean;
}

const MedicationTracker: React.FC<MedicationTrackerProps> = ({ prescriptions, medLogs, onLogMedication, isSubmitting }) => {
    const [logging, setLogging] = useState<string | null>(null);

    const safeFormat = (dateStr: string | undefined | null, formatStr: string) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'N/A';
            return format(date, formatStr);
        } catch (e) {
            return 'N/A';
        }
    };

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
            <Card className="border-dashed border-border bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                        <Pill className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-foreground/80">No Medications Prescribed</h3>
                        <p className="text-xs text-muted-foreground max-w-[240px]">
                            If you have been prescribed medication, it will appear here for easy logging.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prescriptions.map((med) => (
                    <Card key={med.medicationName} className="border-border hover:border-primary/30 transition-colors group">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-md">
                                        <Pill className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold">{med.medicationName}</CardTitle>
                                        {med.dosage && (
                                            <CardDescription className="text-xs font-medium text-muted-foreground">{med.dosage}</CardDescription>
                                        )}
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] uppercase font-semibold tracking-wider bg-green-500/5 text-green-600 border-green-500/20">
                                    {med.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => handleLog(med.medicationName)}
                                disabled={logging === med.medicationName}
                                variant="outline"
                                className="w-full font-semibold text-sm border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                {logging === med.medicationName ? (
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 animate-spin" /> Recording...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" /> Mark as Taken
                                    </span>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Clinical Note</p>
                    <p className="text-xs text-amber-700/80 leading-relaxed">
                        Please follow your provider's instructions exactly. If you experience unexpected side effects, log them in your Emotional Journal and contact your therapist immediately.
                    </p>
                </div>
            </div>

            {/* Intake History */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <History className="h-3.5 w-3.5" /> Intake History
                </h3>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {medLogs.length > 0 ? (
                        [...medLogs].reverse().map((log, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-md bg-muted border border-border hover:border-primary/20 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    <span className="font-semibold text-sm">{log.medicationName}</span>
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                    {safeFormat(log.timestamp, 'MMM d, h:mm a')}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center border border-dashed border-border rounded-md">
                            <p className="text-xs text-muted-foreground">No intake logs recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicationTracker;
