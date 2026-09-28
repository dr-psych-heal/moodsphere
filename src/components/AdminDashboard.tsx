
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Users, Calendar, Activity, BookOpen, BrainCircuit, History,
    TrendingUp, ChevronRight, X, Clock, Filter, Pill, Search,
    ArrowDownAZ, ArrowUpAZ, AlertTriangle, UserMinus, ShieldAlert,
    Plus, Loader2
} from 'lucide-react';
import { MoodEntry, JournalEntry, ThoughtRecord, MedicationPrescription, MedicationLog } from '../types';
import { moodQuestions } from './MoodQuestionnaire';
import { format, isWithinInterval, subDays, startOfWeek, startOfMonth } from 'date-fns';
import MoodGraph from './MoodGraph';
import { addPrescription, deletePrescription } from '../lib/googleSheets';
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AdminDashboardProps {
    allEntries: any[];
    allUsers: { username: string, fullName: string, role: string }[];
    journalEntries?: JournalEntry[];
    thoughtRecords?: ThoughtRecord[];
    prescriptions?: MedicationPrescription[];
    medLogs?: MedicationLog[];
    onRefresh?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    allEntries,
    allUsers,
    journalEntries = [],
    thoughtRecords = [],
    prescriptions = [],
    medLogs = [],
    onRefresh
}) => {
    // --- STATE ---
    const [searchQuery, setSearchQuery] = useState("");
    const [timeframe, setTimeframe] = useState<"all" | "week" | "month" | "today">("all");
    const [minMood, setMinMood] = useState(0);
    const [maxMood, setMaxMood] = useState(10);
    const [minEntries, setMinEntries] = useState(0);
    const [selectedTrigger, setSelectedTrigger] = useState("all");
    const [sortBy, setSortBy] = useState<"activity-desc" | "activity-asc" | "mood-desc" | "mood-asc">("activity-desc");
    const [onMedicationOnly, setOnMedicationOnly] = useState(false);
    const [clinicalFilter, setClinicalFilter] = useState<"none" | "burnout" | "isolation" | "decline" | "gap" | "slippage">("none");

    // --- HELPERS ---
    const mapToMoodEntry = (raw: any): MoodEntry => ({
        date: raw.Date,
        overallScore: parseFloat(raw["Overall Score"]),
        triggers: raw.Triggers ? raw.Triggers.split(', ') : [],
        answers: [
            { questionId: 1, value: parseFloat(raw["Q1: Overall Mood"]) },
            { questionId: 2, value: parseFloat(raw["Q2: Stress"]) },
            { questionId: 3, value: parseFloat(raw["Q3: Social"]) },
            { questionId: 4, value: parseFloat(raw["Q4: Energy"]) },
            { questionId: 5, value: parseFloat(raw["Q5: Satisfaction"]) },
        ]
    });

    const getUserStats = (username: string) => {
        // Filter by Timeframe first
        const now = new Date();
        const interval = timeframe === "today" ? { start: now, end: now }
            : timeframe === "week" ? { start: subDays(now, 7), end: now }
                : timeframe === "month" ? { start: subDays(now, 30), end: now }
                    : null;

        const dateFilter = (dateStr: string) => {
            if (!interval) return true;
            const date = new Date(dateStr);
            return isWithinInterval(date, interval);
        };

        const userEntries = allEntries.filter(e => e.Username === username && dateFilter(e.Date));
        const userJournals = journalEntries.filter(e => e.username === username && dateFilter(e.date));
        const userThoughts = thoughtRecords.filter(e => e.username === username && dateFilter(e.date));
        const userMeds = medLogs.filter(e => e.username === username && dateFilter(e.timestamp));
        const userPrescriptions = prescriptions.filter(e => e.username === username);

        const daysRecorded = userEntries.length;
        const totalActivity = daysRecorded + userJournals.length + userThoughts.length + userMeds.length;

        if (totalActivity === 0 && userPrescriptions.length === 0) return null;

        const sortedMoods = [...userEntries].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
        const lastMoodEntry = sortedMoods.length > 0 ? sortedMoods[sortedMoods.length - 1] : null;

        const avgScore = daysRecorded > 0
            ? parseFloat((userEntries.reduce((sum, e) => sum + parseFloat(e["Overall Score"]), 0) / daysRecorded).toFixed(1))
            : null;

        // Trigger mapping
        const triggerMap: Record<string, number> = {};
        userEntries.forEach(e => {
            const triggers = e.Triggers ? e.Triggers.split(', ') : [];
            triggers.forEach((t: string) => {
                triggerMap[t] = (triggerMap[t] || 0) + 1;
            });
        });

        // Clinical Pattern Detection
        const isBurnout = avgScore !== null && (
            userEntries.some(e => parseFloat(e["Q4: Energy"]) < 4 && parseFloat(e["Q2: Stress"]) < 4) // Low energy + High stress intensity
        );
        const isIsolated = avgScore !== null && (
            userEntries.filter(e => parseFloat(e["Q3: Social"]) < 4).length >= Math.ceil(daysRecorded * 0.5)
        );
        const isSlipping = lastMoodEntry ? (now.getTime() - new Date(lastMoodEntry.Date).getTime()) > 72 * 60 * 60 * 1000 : true;

        // --- Next Due ---
        let nextDue = 'Today';
        if (lastMoodEntry) {
            const nextDate = new Date(lastMoodEntry.Date);
            nextDate.setDate(nextDate.getDate() + 1);
            nextDue = format(nextDate, 'MMM d, yyyy');
        }

        return {
            daysRecorded,
            avgScore,
            totalActivity,
            lastMoodEntry,
            journalCount: userJournals.length,
            thoughtCount: userThoughts.length,
            medCount: userMeds.length,
            onMedication: userPrescriptions.length > 0,
            triggers: Object.keys(triggerMap),
            nextDue,
            allMoods: sortedMoods.map(mapToMoodEntry),
            allJournals: [...userJournals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            allThoughts: [...userThoughts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            allMedLogs: [...userMeds].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
            allPrescriptions: userPrescriptions,
            patterns: { burnout: isBurnout, isolation: isIsolated, slipping: isSlipping }
        };
    };

    // --- COMPUTED: FILTERED & SORTED USERS ---
    const filteredUsers = useMemo(() => {
        let filtered = allUsers.map(user => ({ ...user, stats: getUserStats(user.username) }));

        // Remove users with no stats if not admin
        filtered = filtered.filter(u => u.stats || u.role === 'admin');

        // 1. Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(u => u.fullName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
        }

        // 2. Medication Filter
        if (onMedicationOnly) {
            filtered = filtered.filter(u => u.stats?.onMedication);
        }

        // 3. Mood/Entry Filters
        filtered = filtered.filter(u => {
            if (!u.stats) return true; // Admins with no data stay
            const moodMatch = u.stats.avgScore === null || (u.stats.avgScore >= minMood && u.stats.avgScore <= maxMood);
            const entryMatch = u.stats.daysRecorded >= minEntries;
            const triggerMatch = selectedTrigger === "all" || u.stats.triggers.includes(selectedTrigger);
            return moodMatch && entryMatch && triggerMatch;
        });

        // 4. High Yield Clinical Filters
        if (clinicalFilter !== "none") {
            filtered = filtered.filter(u => {
                if (!u.stats) return false;
                if (clinicalFilter === "burnout") return u.stats.patterns.burnout;
                if (clinicalFilter === "isolation") return u.stats.patterns.isolation;
                if (clinicalFilter === "slippage") return u.stats.patterns.slipping;
                if (clinicalFilter === "gap") return (u.stats.avgScore !== null && u.stats.avgScore < 5) && (u.stats.journalCount === 0 && u.stats.thoughtCount === 0);
                return true;
            });
        }

        // 5. Sorting
        filtered.sort((a, b) => {
            const aStats = a.stats;
            const bStats = b.stats;
            if (!aStats || !bStats) return 0;

            if (sortBy === "activity-desc") return bStats.totalActivity - aStats.totalActivity;
            if (sortBy === "activity-asc") return aStats.totalActivity - bStats.totalActivity;
            if (sortBy === "mood-desc") return (bStats.avgScore || 0) - (aStats.avgScore || 0);
            if (sortBy === "mood-asc") return (aStats.avgScore || 0) - (bStats.avgScore || 0);
            return 0;
        });

        return filtered;
    }, [allUsers, searchQuery, onMedicationOnly, minMood, maxMood, minEntries, selectedTrigger, sortBy, timeframe, clinicalFilter]);

    const allAvailableTriggers = useMemo(() => {
        const set = new Set<string>();
        allEntries.forEach(e => {
            if (e.Triggers) e.Triggers.split(', ').forEach((t: string) => set.add(t));
        });
        return Array.from(set).sort();
    }, [allEntries]);

    // --- HELPERS ---
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

    // --- MODAL COMPONENT ---
    const UserDetailModal = ({ user }: { user: any }) => {
        const stats = user.stats;
        const [isAddingMed, setIsAddingMed] = useState(false);
        const [newMedName, setNewMedName] = useState("");
        const [newMedDosage, setNewMedDosage] = useState("");
        const [isSubmitting, setIsSubmitting] = useState(false);

        if (!stats) return null;

        const handleAddPrescription = async () => {
            if (!newMedName || !newMedDosage) {
                toast({ title: "Missing details", description: "Please enter medication name and dosage.", variant: "destructive" });
                return;
            }

            setIsSubmitting(true);
            const success = await addPrescription({
                username: user.username,
                medicationName: newMedName,
                dosage: newMedDosage,
                status: 'Active'
            });

            if (success) {
                toast({ title: "Prescription Added", description: `Assigned ${newMedName} to ${user.fullName}.` });
                setNewMedName("");
                setNewMedDosage("");
                setIsAddingMed(false);
                if (onRefresh) onRefresh();
            } else {
                toast({ title: "Error", description: "Failed to add prescription.", variant: "destructive" });
            }
            setIsSubmitting(false);
        };

        const handleDeletePrescription = async (medName: string) => {
            if (isSubmitting) return;

            if (window.confirm(`Are you sure you want to remove ${medName}?`)) {
                setIsSubmitting(true);
                const success = await deletePrescription(user.username, medName);
                if (success) {
                    toast({ title: "Prescription Removed", description: `Removed ${medName} from ${user.fullName}'s records.` });
                    if (onRefresh) onRefresh();
                } else {
                    toast({ title: "Error", description: "Failed to remove prescription.", variant: "destructive" });
                }
                setIsSubmitting(false);
            }
        };

        return (
            <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-card border-border rounded-lg">
                <DialogHeader className="p-5 md:p-7 bg-muted border-b border-border">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <DialogTitle className="text-lg md:text-2xl font-bold text-foreground leading-none">{user.fullName}</DialogTitle>
                            <DialogDescription className="font-mono text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground">
                                Electronic Health Record · @{user.username}
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            {stats.onMedication && (
                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-2 py-1 font-semibold text-[8px] md:text-[10px] tracking-wider">
                                    ON MEDICATION
                                </Badge>
                            )}
                            <Badge variant="outline" className="px-2 py-1 font-semibold text-[8px] md:text-[10px] tracking-wider">{user.role}</Badge>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="p-5 md:p-8 space-y-8 md:space-y-12 pb-20">
                        {/* 1. Clinical Overview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 rounded-md bg-muted border border-border text-center">
                                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-0.5">Avg Mood</p>
                                <p className="text-2xl font-bold text-foreground">{stats.avgScore || "N/A"}</p>
                            </div>
                            <div className="p-3 rounded-md bg-muted border border-border text-center">
                                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-0.5">Engagements</p>
                                <p className="text-2xl font-bold text-foreground">{stats.totalActivity}</p>
                            </div>
                            <div className="p-3 rounded-md bg-muted border border-border text-center">
                                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-0.5">CBT Active</p>
                                <p className="text-2xl font-bold text-foreground">{stats.thoughtCount}</p>
                            </div>
                            <div className="p-3 rounded-md bg-muted border border-border text-center">
                                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-0.5">Meds Taken</p>
                                <p className="text-2xl font-bold text-foreground">{stats.medCount}</p>
                            </div>
                        </div>

                        {/* 2. Mood Trends */}
                        <section className="space-y-3">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground uppercase tracking-tight">
                                <Activity className="h-4 w-4 text-muted-foreground" /> Biological Trends
                            </h3>
                            <Card className="p-2 lg:p-5 bg-card border-border overflow-hidden">
                                <MoodGraph data={stats.allMoods} height={250} hideHeader />
                            </Card>
                        </section>

                        {/* 3. Medication & CBT (Clinical Data) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Medication Column */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Pill className="h-3.5 w-3.5" /> Prescriptions & Adherence
                                </h4>

                                {isAddingMed ? (
                                    <div className="p-4 rounded-lg bg-muted border border-border space-y-3 animate-in slide-in-from-top-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Medication Name</Label>
                                            <Input value={newMedName} onChange={(e) => setNewMedName(e.target.value)} placeholder="e.g. Sertraline" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dosage & Schedule</Label>
                                            <Input value={newMedDosage} onChange={(e) => setNewMedDosage(e.target.value)} placeholder="e.g. 50mg Once Daily" />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleAddPrescription} disabled={isSubmitting} className="flex-1 font-semibold text-sm h-9">
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Assignment"}
                                            </Button>
                                            <Button variant="outline" onClick={() => setIsAddingMed(false)} className="font-semibold text-sm h-9">Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button onClick={() => setIsAddingMed(true)} variant="outline" className="w-full border-dashed border-border hover:border-amber-500/40 hover:bg-amber-500/5 text-muted-foreground rounded-md py-6 flex flex-col gap-1">
                                        <Plus className="h-4 w-4" />
                                        <span className="text-[10px] font-semibold uppercase tracking-wider">Add New Prescription</span>
                                    </Button>
                                )}

                                <div className="space-y-4">
                                    {stats.allPrescriptions.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                {stats.allPrescriptions.map((p, i) => (
                                                    <Badge key={i} className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 group/badge relative pr-8">
                                                        {p.medicationName} ({p.dosage})
                                                        <button
                                                            onClick={() => handleDeletePrescription(p.medicationName)}
                                                            disabled={isSubmitting}
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full transition-colors opacity-0 group-hover/badge:opacity-100 disabled:opacity-0"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                                {stats.allMedLogs.map((l, i) => (
                                                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-500/5 text-xs">
                                                        <span className="font-bold">{l.medicationName}</span>
                                                        <span className="text-muted-foreground dark:text-foreground/60">{safeFormat(l.timestamp, 'MMM d, h:mm a')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 border border-dashed border-border rounded-md text-center opacity-30">
                                            <Pill className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-[10px] font-semibold uppercase text-muted-foreground">No Active Medications</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CBT Column */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <BrainCircuit className="h-3.5 w-3.5" /> Cognitive Records
                                </h4>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                    {stats.allThoughts.map((t, i) => (
                                        <div key={i} className="p-4 rounded-md bg-muted border border-border space-y-3">
                                            <div className="flex justify-between">
                                                <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/10 text-[9px] uppercase font-semibold">{t.emotion}</Badge>
                                                <span className="text-[10px] text-muted-foreground">{safeFormat(t.date, 'MMM d')}</span>
                                            </div>
                                            <p className="text-xs font-semibold leading-tight line-clamp-2 text-foreground/80">"{t.situation}"</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-destructive" style={{ width: `${t.intensityScore}%` }} />
                                                </div>
                                                <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
                                                <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500" style={{ width: `${t.emotionAfterIntensity}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {stats.allThoughts.length === 0 && <p className="text-[10px] text-center text-muted-foreground/40 py-8">No CBT work recorded.</p>}
                                </div>
                            </div>
                        </div>

                        {/* 4. Qualitative Journals */}
                        <section className="space-y-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <BookOpen className="h-3.5 w-3.5" /> Emotional Journal Logs
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {stats.allJournals.map((j, i) => (
                                    <div key={i} className="p-4 rounded-md bg-muted border border-border space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            <span>Entry #{j.dayNumber || stats.allJournals.length - i}</span>
                                            <span>{safeFormat(j.date, 'MMM d, p')}</span>
                                        </div>
                                        <p className="text-sm text-foreground/80 leading-relaxed">"{j.content}"</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </ScrollArea>
            </DialogContent>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* --- ADVANCED FILTER HEADER --- */}
            <div className="bg-card rounded-lg p-5 border border-border space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                        <Input
                            placeholder="Search patients by name or ID..."
                            className="pl-10 py-5 rounded-md bg-muted border-border"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="rounded-md h-10 px-5 gap-2 border-border font-semibold text-sm">
                                    <Filter className="h-4 w-4" /> Triage Filters
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-5 rounded-lg bg-card border-border space-y-5">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Timeframe Scope</Label>
                                    <Select value={timeframe} onValueChange={(v: any) => setTimeframe(v)}>
                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Lifetime Records</SelectItem>
                                            <SelectItem value="today">Today Only</SelectItem>
                                            <SelectItem value="week">Past 7 Days</SelectItem>
                                            <SelectItem value="month">Past 30 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Diagnostic Range: Mood ({minMood}-{maxMood})</Label>
                                    <Slider
                                        value={[minMood, maxMood]}
                                        max={10}
                                        step={0.5}
                                        onValueChange={([min, max]) => { setMinMood(min); setMaxMood(max); }}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Specific Trigger</Label>
                                    <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Triggers</SelectItem>
                                            {allAvailableTriggers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <Label className="font-bold text-sm">On Medication Only</Label>
                                    <Switch checked={onMedicationOnly} onCheckedChange={setOnMedicationOnly} />
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                            <SelectTrigger className="rounded-md h-10 w-[180px] border-border font-semibold text-sm px-3">
                                <SelectValue placeholder="Sort Analysis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="activity-desc">Most Active First</SelectItem>
                                <SelectItem value="activity-asc">Least Active First</SelectItem>
                                <SelectItem value="mood-desc">Highest Mood First</SelectItem>
                                <SelectItem value="mood-asc">Lowest Mood First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* QUICK CLINICAL TAGS */}
                <div className="flex flex-wrap gap-2 pt-1">
                    <Badge
                        onClick={() => setClinicalFilter(clinicalFilter === "burnout" ? "none" : "burnout")}
                        className={`cursor-pointer px-3 py-1 rounded-md transition-colors border-none text-xs font-semibold ${clinicalFilter === "burnout" ? "bg-destructive text-white" : "bg-destructive/10 text-destructive hover:bg-destructive/20"}`}
                    >
                        <ShieldAlert className="h-3 w-3 mr-1.5" /> Burnout Risk
                    </Badge>
                    <Badge
                        onClick={() => setClinicalFilter(clinicalFilter === "isolation" ? "none" : "isolation")}
                        className={`cursor-pointer px-3 py-1 rounded-md transition-colors border-none text-xs font-semibold ${clinicalFilter === "isolation" ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"}`}
                    >
                        <UserMinus className="h-3 w-3 mr-1.5" /> Social Isolation
                    </Badge>
                    <Badge
                        onClick={() => setClinicalFilter(clinicalFilter === "slippage" ? "none" : "slippage")}
                        className={`cursor-pointer px-3 py-1 rounded-md transition-colors border-none text-xs font-semibold ${clinicalFilter === "slippage" ? "bg-muted-foreground text-white" : "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"}`}
                    >
                        <Clock className="h-3 w-3 mr-1.5" /> 72h+ Inactive
                    </Badge>
                    <Badge
                        onClick={() => setClinicalFilter(clinicalFilter === "gap" ? "none" : "gap")}
                        className={`cursor-pointer px-3 py-1 rounded-md transition-colors border-none text-xs font-semibold ${clinicalFilter === "gap" ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                    >
                        <AlertTriangle className="h-3 w-3 mr-1.5" /> Therapy Gap
                    </Badge>
                    {clinicalFilter !== "none" && (
                        <Button variant="ghost" size="sm" onClick={() => setClinicalFilter("none")} className="h-7 text-[10px] font-semibold uppercase text-muted-foreground">Clear</Button>
                    )}
                </div>
            </div>

            {/* --- USER GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => {
                    const stats = user.stats;

                    return (
                        <Dialog key={user.username}>
                            <DialogTrigger asChild>
                                <Card className="overflow-hidden border-border bg-card group relative cursor-pointer hover:border-primary/30 active:scale-[0.99] transition-all rounded-lg">
                                    {user.role === 'admin' && (
                                        <div className="absolute top-0 right-0 p-2">
                                            <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5 uppercase tracking-tight font-semibold">STAFF</Badge>
                                        </div>
                                    )}
                                    <CardHeader className="pb-2 bg-muted/50 border-b border-border">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">{user.fullName}</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <CardDescription className="text-[10px] font-mono uppercase tracking-tight text-muted-foreground">@{user.username}</CardDescription>
                                                    {stats?.onMedication && <Pill className="h-3 w-3 text-amber-500" />}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="uppercase text-[9px] font-semibold px-2 h-5 tracking-wider">
                                                {user.role}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        {stats ? (
                                            <>
                                                {/* Diagnostic Stats */}
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="bg-muted rounded-md p-2.5 text-center border border-border">
                                                        <p className="text-[9px] uppercase text-muted-foreground font-semibold mb-0.5">Avg</p>
                                                        <p className={`text-lg font-bold leading-none ${(stats.avgScore || 0) < 5 ? 'text-destructive' : 'text-foreground'}`}>{stats.avgScore || "N/A"}</p>
                                                    </div>
                                                    <div className="bg-muted rounded-md p-2.5 text-center border border-border">
                                                        <p className="text-[9px] uppercase text-muted-foreground font-semibold mb-0.5">Moods</p>
                                                        <p className="text-lg font-bold text-foreground leading-none">{stats.daysRecorded}</p>
                                                    </div>
                                                    <div className="bg-muted rounded-md p-2.5 text-center border border-border">
                                                        <p className="text-[9px] uppercase text-muted-foreground font-semibold mb-0.5">Total</p>
                                                        <p className="text-lg font-bold text-foreground leading-none">{stats.totalActivity}</p>
                                                    </div>
                                                </div>

                                                {/* Sparkline Trend */}
                                                {stats.allMoods.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-baseline justify-between">
                                                            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Trend</p>
                                                            {stats.patterns.slipping && <Badge variant="outline" className="text-[8px] text-destructive border-destructive/20 bg-destructive/5 font-semibold uppercase h-4">Critical Slippage</Badge>}
                                                        </div>
                                                        <MoodGraph data={stats.allMoods} compact />
                                                    </div>
                                                )}

                                                {/* Detailed Meta Footer */}
                                                <div className="pt-3 border-t border-border flex justify-between items-end">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{stats.lastMoodEntry ? format(new Date(stats.lastMoodEntry.Date), 'MMM d, h:mm a') : 'No Records'}</span>
                                                        </div>
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Next: {stats.nextDue}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex gap-1">
                                                            {stats.thoughtCount > 0 && <Badge className="h-1.5 w-1.5 rounded-full p-0 bg-destructive border-none" />}
                                                            {stats.journalCount > 0 && <Badge className="h-1.5 w-1.5 rounded-full p-0 bg-primary border-none" />}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                                                            <span className="text-[10px] font-semibold uppercase tracking-wider">Review</span>
                                                            <ChevronRight className="h-3 w-3" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-20 text-center space-y-3 opacity-30">
                                                <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
                                                <p className="text-[10px] font-semibold uppercase tracking-widest">Awaiting Clinical Record</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                            <UserDetailModal user={user} />
                        </Dialog>
                    );
                })}

                {filteredUsers.length === 0 && (
                    <div className="col-span-full py-32 text-center space-y-4 opacity-40">
                        <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold uppercase tracking-wider text-foreground">No Matches Found</h3>
                            <p className="text-sm text-muted-foreground">Try adjusting your triage filters or search query.</p>
                        </div>
                        <Button onClick={() => {
                            setSearchQuery(""); setTimeframe("all"); setMinMood(0); setMaxMood(10);
                            setSelectedTrigger("all"); setOnMedicationOnly(false); setClinicalFilter("none");
                        }} variant="outline" className="rounded-md px-6 border-border">Reset All Filters</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
