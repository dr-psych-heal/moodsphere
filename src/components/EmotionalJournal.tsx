
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { JournalEntry } from '../types';
import { format } from 'date-fns';
import { BookOpen, PenTool, Send, History, CheckCircle2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface EmotionalJournalProps {
    entries: JournalEntry[];
    onSave: (content: string) => Promise<void>;
    isSubmitting: boolean;
}

const EmotionalJournal: React.FC<EmotionalJournalProps> = ({ entries, onSave, isSubmitting }) => {
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        await onSave(content);
        setContent('');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Input Section */}
                <Card className="w-full md:w-5/12 border-border bg-card h-fit md:sticky md:top-32 mb-6 md:mb-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground text-base font-bold">
                            <PenTool className="h-4 w-4 text-primary" /> Express Yourself
                        </CardTitle>
                        <CardDescription>
                            Write down your emotional responses or any thoughts important to you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Textarea
                                placeholder="How are you feeling right now? What's on your mind?"
                                className="min-h-[180px] text-base leading-relaxed"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <Button
                                type="submit"
                                className="w-full py-5 text-sm font-bold"
                                disabled={isSubmitting || !content.trim()}
                            >
                                {isSubmitting ? 'Saving...' : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Save Entry
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History Section */}
                <div className="w-full md:w-7/12 space-y-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                            <History className="h-4 w-4 text-muted-foreground" /> Your Journal History
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                            {entries.length} Entries
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        {entries.length > 0 ? (
                            [...entries].reverse().map((entry, index) => {
                                const actualIndex = entries.length - index;
                                return (
                                    <Card key={index} className="border-border bg-card group hover:border-primary/30 transition-colors">
                                        <CardContent className="pt-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="font-semibold text-muted-foreground uppercase tracking-tight text-xs">
                                                        Entry #{actualIndex}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {(() => {
                                                        try {
                                                            const d = new Date(entry.date);
                                                            return isNaN(d.getTime()) ? 'N/A' : format(d, 'MMMM d, yyyy · h:mm a');
                                                        } catch (e) {
                                                            return 'N/A';
                                                        }
                                                    })()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap bg-muted p-3 rounded-md border border-border">
                                                "{entry.content}"
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="text-center py-16 border border-dashed border-border rounded-lg">
                                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                                <p className="text-muted-foreground text-sm">Your journaling journey begins with your first entry.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmotionalJournal;
