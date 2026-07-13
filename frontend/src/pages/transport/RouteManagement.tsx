import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Map, MapPin, Plus, Trash2 } from 'lucide-react';

export default function RouteManagement() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [routeName, setRouteName] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [stops, setStops] = useState([{ stopName: '', pickupTime: '', dropTime: '', monthlyFee: 0 }]);

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await api.get('/transport/vehicles');
      return res.data.data;
    },
  });

  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const res = await api.get('/transport/routes');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/transport/routes', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Route created successfully');
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setRouteName('');
      setVehicleId('');
      setStops([{ stopName: '', pickupTime: '', dropTime: '', monthlyFee: 0 }]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create route');
    },
  });

  const handleAddStop = () => {
    setStops([...stops, { stopName: '', pickupTime: '', dropTime: '', monthlyFee: 0 }]);
  };

  const handleRemoveStop = (index: number) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const handleStopChange = (index: number, field: string, value: any) => {
    const newStops: any = [...stops];
    newStops[index][field] = field === 'monthlyFee' ? Number(value) : value;
    setStops(newStops);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ routeName, vehicle: vehicleId, stops });
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Route Management</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>Create Route</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Transport Route</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Route Name</Label>
                  <Input 
                    placeholder="e.g. Downtown Express" 
                    value={routeName}
                    onChange={(e: any) => setRouteName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assign Vehicle</Label>
                  <Select 
                    value={vehicleId} 
                    onValueChange={(val: any) => setVehicleId(val)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Vehicle" /></SelectTrigger>
                    <SelectContent>
                      {vehicles?.map((v: any) => (
                        <SelectItem key={v._id} value={v._id}>{v.vehicleNumber} ({v.capacity} seats)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg">Stops & Timings</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddStop}>
                    <Plus className="h-4 w-4 mr-2" /> Add Stop
                  </Button>
                </div>
                
                {stops.map((stop, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end border p-3 rounded bg-muted/20">
                    <div className="col-span-4 space-y-1">
                      <Label className="text-xs">Stop Name</Label>
                      <Input value={stop.stopName} onChange={(e) => handleStopChange(index, 'stopName', e.target.value)} required />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Pickup Time</Label>
                      <Input type="time" value={stop.pickupTime} onChange={(e) => handleStopChange(index, 'pickupTime', e.target.value)} required />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Drop Time</Label>
                      <Input type="time" value={stop.dropTime} onChange={(e) => handleStopChange(index, 'dropTime', e.target.value)} required />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Monthly Fee (₹)</Label>
                      <Input type="number" min="0" value={stop.monthlyFee} onChange={(e) => handleStopChange(index, 'monthlyFee', e.target.value)} required />
                    </div>
                    <div className="col-span-1 pb-1">
                      <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveStop(index)} disabled={stops.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending || !vehicleId}>
                {createMutation.isPending ? 'Saving...' : 'Create Route'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {routes?.length === 0 ? (
          <p className="text-muted-foreground">No routes created yet.</p>
        ) : (
          routes?.map((route: any) => (
            <Card key={route._id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    {route.routeName}
                  </CardTitle>
                  <span className="text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                    {route.vehicle?.vehicleNumber}
                  </span>
                </div>
                <CardDescription>
                  Driver: {route.vehicle?.driverName} ({route.vehicle?.driverContact})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mt-2 relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-border pl-8">
                  {route.stops.map((stop: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-9 top-1 bg-background border-2 border-primary rounded-full p-1 z-10">
                        <MapPin className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{stop.stopName}</p>
                          <p className="text-xs text-muted-foreground">
                            Pickup: {stop.pickupTime} | Drop: {stop.dropTime}
                          </p>
                        </div>
                        <p className="font-semibold text-sm">₹{stop.monthlyFee}/mo</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
