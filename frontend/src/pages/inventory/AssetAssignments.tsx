import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { PackageMinus, CornerDownLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AssetAssignments() {
  const queryClient = useQueryClient();
  const [assignedTo, setAssignedTo] = useState('');
  const [itemId, setItemId] = useState('');
  const [qty, setQty] = useState('1');

  const { data: items } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const res = await api.get('/inventory/items');
      return res.data.data;
    },
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const res = await api.get('/inventory/assignments');
      return res.data.data;
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/inventory/assign', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Asset assigned successfully');
      setAssignedTo('');
      setItemId('');
      setQty('1');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign asset');
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const res = await api.post('/inventory/return', { assignmentId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Asset returned successfully');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to return asset');
    },
  });

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTo || !itemId) return toast.error('Please fill all fields');
    assignMutation.mutate({ assignedTo, itemId, quantityAssigned: Number(qty) });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Asset Lending & Assignments</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Assignment Form */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageMinus className="h-5 w-5" /> Assign Asset
            </CardTitle>
            <CardDescription>Give an item to a staff member.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssign} className="space-y-4">
              <div className="space-y-2">
                <Label>Staff User ID</Label>
                <Input 
                  placeholder="Paste User ObjectId" 
                  value={assignedTo}
                  onChange={(e: any) => setAssignedTo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Item from Catalog</Label>
                <Select value={itemId} onValueChange={(val: any) => setItemId(val)}>
                  <SelectTrigger><SelectValue placeholder="Select Item" /></SelectTrigger>
                  <SelectContent>
                    {items?.map((i: any) => (
                      <SelectItem key={i._id} value={i._id} disabled={i.quantity === 0}>
                        {i.itemName} (Avail: {i.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity to Assign</Label>
                <Input 
                  type="number" min="1"
                  value={qty}
                  onChange={(e: any) => setQty(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={assignMutation.isPending || !itemId}>
                {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Assignment History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading history...</p>
            ) : assignments?.length === 0 ? (
              <p className="text-muted-foreground">No assets have been assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {assignments?.map((alloc: any) => (
                  <div key={alloc._id} className={`flex justify-between items-center p-4 border rounded-lg ${alloc.status === 'RETURNED' ? 'bg-muted/30 border-dashed' : 'bg-card'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg">{alloc.item?.itemName}</p>
                        <Badge variant={alloc.status === 'RETURNED' ? 'outline' : 'default'} className={alloc.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}>
                          {alloc.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assigned to: {alloc.assignedTo?.firstName} {alloc.assignedTo?.lastName} ({alloc.assignedTo?.role})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigned: {format(new Date(alloc.assignedDate), 'PPp')}
                        {alloc.returnDate && ` | Returned: ${format(new Date(alloc.returnDate), 'PPp')}`}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-bold text-xl">
                        {alloc.quantityAssigned} <span className="text-xs text-muted-foreground font-normal">{alloc.item?.unit}</span>
                      </p>
                      {alloc.status === 'ASSIGNED' && (
                        <Button 
                          variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => returnMutation.mutate(alloc._id)}
                          disabled={returnMutation.isPending}
                        >
                          <CornerDownLeft className="h-4 w-4 mr-1" /> Return Item
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
