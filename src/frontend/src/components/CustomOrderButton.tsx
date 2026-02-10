import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateCustomOrderRequest } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface CustomOrderButtonProps {
  shopId: bigint;
}

export function CustomOrderButton({ shopId }: CustomOrderButtonProps) {
  const { identity, login } = useInternetIdentity();
  const createOrder = useCreateCustomOrderRequest();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please login to request a custom order');
      login();
      return;
    }

    if (!description.trim()) {
      toast.error('Please describe your custom order request');
      return;
    }

    try {
      await createOrder.mutateAsync({
        shopId,
        description: description.trim(),
      });
      toast.success('Custom order request submitted!');
      setDescription('');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    }
  };

  return (
    <>
      <Button onClick={() => identity ? setOpen(true) : login()} variant="outline">
        <MessageSquare className="mr-2 h-4 w-4" />
        Request Custom Order
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request a Custom Order</DialogTitle>
            <DialogDescription>
              Describe what you'd like the artisan to create for you.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Your Request</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="I would love a custom piece that..."
                rows={6}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
