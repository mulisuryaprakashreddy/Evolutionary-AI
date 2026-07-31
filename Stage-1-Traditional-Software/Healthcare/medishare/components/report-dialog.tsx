'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase, useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

const REASONS = [
  'Fake or misleading listing',
  'Unsafe or broken equipment',
  'Spam or scam',
  'Inappropriate content',
  'Prohibited item',
  'Other',
];

export function ReportDialog({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) {
      toast.info('Sign in to report a listing');
      setOpen(false);
      return;
    }
    if (!reason) {
      toast.error('Please choose a reason');
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from('reports')
      .insert({ listing_id: listingId, reporter_id: user.id, reason, details: details || null });
    setBusy(false);
    if (error) {
      toast.error('Could not submit report. Please try again.');
      return;
    }
    toast.success('Report submitted. Thank you for keeping MedShare safe.');
    setOpen(false);
    setReason('');
    setDetails('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <Flag className="h-4 w-4" /> Report listing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this listing</DialogTitle>
          <DialogDescription>
            Help us keep MedShare safe. Our team reviews every report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason" className="mt-1.5">
                <SelectValue placeholder="Choose a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Tell us more about the issue..."
              className="mt-1.5"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy} variant="destructive">
            {busy ? 'Submitting...' : 'Submit report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
