import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Bus, UserPlus } from 'lucide-react';

export default function TransportAllocations() {
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [stopId, setStopId] = useState('');

  const { data: routes } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const res = await api.get('/transport/routes');
      return res.data.data;
    },
  });

  const { data: allocations, isLoading } = useQuery({
    queryKey: ['allocations', routeId],
    queryFn: async () => {
      const url = routeId ? `/transport/allocations?routeId=${routeId}` : '/transport/allocations';
      const res = await api.get(url);
      return res.data.data;
    },
  });

  const allocateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/transport/allocations', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Student allocated to transport successfully');
      setStudentId('');
      setStopId('');
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to allocate student');
    },
  });

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !routeId || !stopId) return toast.error('Please fill all fields');
    allocateMutation.mutate({ studentId, routeId, stopId });
  };

  const selectedRouteObj = routes?.find((r: any) => r._id === routeId);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Transport Allocations</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Allocation Form */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Allocate Seat
            </CardTitle>
            <CardDescription>Assign a student to a bus route.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAllocate} className="space-y-4">
              <div className="space-y-2">
                <Label>Student Profile ID</Label>
                <Input 
                  placeholder="Paste Student ObjectId" 
                  value={studentId}
                  onChange={(e: any) => setStudentId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Route</Label>
                <Select value={routeId} onValueChange={(val: any) => { setRouteId(val); setStopId(''); }}>
                  <SelectTrigger><SelectValue placeholder="Select Route" /></SelectTrigger>
                  <SelectContent>
                    {routes?.map((r: any) => (
                      <SelectItem key={r._id} value={r._id}>{r.routeName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedRouteObj && (
                <div className="space-y-2">
                  <Label>Pickup / Drop Stop</Label>
                  <Select value={stopId} onValueChange={(val: any) => setStopId(val)}>
                    <SelectTrigger><SelectValue placeholder="Select Stop" /></SelectTrigger>
                    <SelectContent>
                      {selectedRouteObj.stops.map((stop: any) => (
                        <SelectItem key={stop._id} value={stop._id}>
                          {stop.stopName} (₹{stop.monthlyFee}/mo)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={allocateMutation.isPending || !stopId}>
                {allocateMutation.isPending ? 'Allocating...' : 'Confirm Allocation'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="md:col-span-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Active Allocations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading allocations...</p>
            ) : allocations?.length === 0 ? (
              <p className="text-muted-foreground">No active allocations found.</p>
            ) : (
              <div className="space-y-4">
                {allocations?.map((alloc: any) => (
                  <div key={alloc._id} className="flex justify-between items-center p-4 border rounded-lg bg-card">
                    <div>
                      <p className="font-semibold">{alloc.student?.user?.firstName} {alloc.student?.user?.lastName}</p>
                      <p className="text-sm text-muted-foreground">Admn No: {alloc.student?.admissionNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary flex items-center justify-end gap-1">
                        <Bus className="h-4 w-4" /> {alloc.route?.routeName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Stop: {alloc.route?.stops?.find((s: any) => s._id === alloc.stopId)?.stopName || 'Unknown'}
                      </p>
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
