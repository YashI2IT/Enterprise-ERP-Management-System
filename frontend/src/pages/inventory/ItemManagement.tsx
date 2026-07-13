import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { PackagePlus, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ItemManagement() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [restockQty, setRestockQty] = useState('');
  
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'STATIONARY',
    quantity: '0',
    unit: 'pcs',
    location: '',
    minThreshold: '5',
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const res = await api.get('/inventory/items');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/inventory/items', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Item added to inventory');
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      setFormData({ itemName: '', category: 'STATIONARY', quantity: '0', unit: 'pcs', location: '', minThreshold: '5' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add item');
    },
  });

  const restockMutation = useMutation({
    mutationFn: async ({ id, qty }: { id: string, qty: number }) => {
      const res = await api.put(`/inventory/items/${id}/restock`, { quantityToAdd: qty });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Stock replenished');
      setIsRestockOpen(false);
      setRestockQty('');
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to restock');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      quantity: Number(formData.quantity),
      minThreshold: Number(formData.minThreshold),
    });
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    restockMutation.mutate({ id: selectedItemId, qty: Number(restockQty) });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Catalog</h1>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger>
            <Button><PackagePlus className="h-4 w-4 mr-2" /> Add New Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register Inventory Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input 
                  placeholder="e.g. A4 Paper Reams" 
                  value={formData.itemName}
                  onChange={(e: any) => setFormData({...formData, itemName: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(val: any) => setFormData({...formData, category: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STATIONARY">Stationary</SelectItem>
                      <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                      <SelectItem value="LAB_EQUIPMENT">Lab Equipment</SelectItem>
                      <SelectItem value="FURNITURE">Furniture</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unit (e.g. pcs, boxes)</Label>
                  <Input 
                    value={formData.unit}
                    onChange={(e: any) => setFormData({...formData, unit: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Initial Quantity</Label>
                  <Input 
                    type="number" min="0"
                    value={formData.quantity}
                    onChange={(e: any) => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Threshold</Label>
                  <Input 
                    type="number" min="0"
                    value={formData.minThreshold}
                    onChange={(e: any) => setFormData({...formData, minThreshold: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Storage Location</Label>
                <Input 
                  placeholder="e.g. Main Office Closet" 
                  value={formData.location}
                  onChange={(e: any) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Add Item'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRestock} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Quantity to Add</Label>
              <Input 
                type="number" min="1"
                placeholder="How many units did we receive?" 
                value={restockQty}
                onChange={(e: any) => setRestockQty(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={restockMutation.isPending}>
              {restockMutation.isPending ? 'Restocking...' : 'Add Stock'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Catalog List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading items...</p>
          ) : items?.length === 0 ? (
            <p className="text-muted-foreground">No items in the catalog.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Stock Level</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item: any) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.location}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className={`font-bold text-lg ${item.quantity <= item.minThreshold ? 'text-red-500' : 'text-green-600'}`}>
                          {item.quantity}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-none">{item.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" size="sm"
                        onClick={() => {
                          setSelectedItemId(item._id);
                          setIsRestockOpen(true);
                        }}
                      >
                        <RefreshCcw className="h-4 w-4 mr-2" /> Restock
                      </Button>
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
