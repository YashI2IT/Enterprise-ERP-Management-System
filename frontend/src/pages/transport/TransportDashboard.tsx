import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Bus, Map, Users } from 'lucide-react';

export default function TransportDashboard() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    capacity: '',
    driverName: '',
    driverContact: '',
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await api.get('/transport/vehicles');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/transport/vehicles', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Vehicle added successfully');
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setFormData({ vehicleNumber: '', capacity: '', driverName: '', driverContact: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add vehicle');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      capacity: Number(formData.capacity),
    });
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  let totalCapacity = 0;
  vehicles?.forEach((v: any) => totalCapacity += v.capacity);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Transport Overview</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>Add Vehicle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vehicle Number (License Plate)</Label>
                  <Input 
                    placeholder="MH-12-AB-1234" 
                    value={formData.vehicleNumber}
                    onChange={(e: any) => setFormData({...formData, vehicleNumber: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacity (Seats)</Label>
                  <Input 
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e: any) => setFormData({...formData, capacity: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Driver Name</Label>
                  <Input 
                    value={formData.driverName}
                    onChange={(e: any) => setFormData({...formData, driverName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Driver Contact</Label>
                  <Input 
                    value={formData.driverContact}
                    onChange={(e: any) => setFormData({...formData, driverContact: e.target.value})}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Add Vehicle'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Seat Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mt-2">Check Routes tab</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Fleet</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles?.length === 0 ? (
            <p className="text-muted-foreground">No vehicles registered yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle Number</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Driver Contact</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles?.map((v: any) => (
                  <TableRow key={v._id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Bus className="h-4 w-4 text-primary" />
                      {v.vehicleNumber}
                    </TableCell>
                    <TableCell>{v.capacity} seats</TableCell>
                    <TableCell>{v.driverName}</TableCell>
                    <TableCell>{v.driverContact}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${v.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {v.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
