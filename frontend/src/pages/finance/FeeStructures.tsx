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

export default function FeeStructures() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    academicYear: new Date().getFullYear().toString(),
    applicableGrades: '',
    dueDate: '',
  });

  const { data: structures, isLoading } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: async () => {
      const res = await api.get('/fees/structures');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newStructure: any) => {
      const res = await api.post('/fees/structures', newStructure);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Fee structure created successfully');
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      setFormData({
        name: '', description: '', amount: '', academicYear: new Date().getFullYear().toString(), applicableGrades: '', dueDate: ''
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create fee structure');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: Number(formData.amount),
      applicableGrades: formData.applicableGrades.split(',').map(s => s.trim()),
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Fee Structures</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>Create New Structure</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Fee Structure</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  placeholder="e.g. Term 1 Tuition Fee" 
                  value={formData.name}
                  onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  value={formData.description}
                  onChange={(e: any) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input 
                    type="number" 
                    min="0"
                    value={formData.amount}
                    onChange={(e: any) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Input 
                    value={formData.academicYear}
                    onChange={(e: any) => setFormData({...formData, academicYear: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Applicable Grades (Comma separated)</Label>
                <Input 
                  placeholder="e.g. 9, 10, 11" 
                  value={formData.applicableGrades}
                  onChange={(e: any) => setFormData({...formData, applicableGrades: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  type="date" 
                  value={formData.dueDate}
                  onChange={(e: any) => setFormData({...formData, dueDate: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Structure'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Structures</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading fee structures...</p>
          ) : structures?.length === 0 ? (
            <p className="text-muted-foreground">No fee structures found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Grades</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structures.map((fs: any) => (
                  <TableRow key={fs._id}>
                    <TableCell className="font-medium">{fs.name}</TableCell>
                    <TableCell>{fs.academicYear}</TableCell>
                    <TableCell>{fs.applicableGrades.join(', ')}</TableCell>
                    <TableCell>{new Date(fs.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-semibold">₹{fs.amount.toLocaleString()}</TableCell>
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
