import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

const fetchAttendance = async (date: string, grade: string, section: string) => {
  if (!date || !grade || !section) return null;
  const { data } = await api.get(`/attendance?date=${date}&grade=${grade}&section=${section}`);
  return data;
};

const Attendance = () => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', date, grade, section],
    queryFn: () => fetchAttendance(date, grade, section),
    enabled: !!date && !!grade && !!section,
  });

  const [localRecords, setLocalRecords] = useState<any[]>([]);

  // Update local records when data changes
  React.useEffect(() => {
    if (data?.data?.records) {
      // Create a local copy to manipulate before saving
      setLocalRecords(data.data.records);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (recordsToSave: any) => {
      return api.post('/attendance', {
        date,
        grade,
        section,
        records: recordsToSave,
      });
    },
    onSuccess: () => {
      toast.success('Attendance saved successfully');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    },
  });

  const handleStatusChange = (index: number, status: string) => {
    const newRecords = [...localRecords];
    newRecords[index].status = status;
    setLocalRecords(newRecords);
  };

  const handleSave = () => {
    const formattedRecords = localRecords.map(r => ({
      student: r.student._id || r.student, // Handle populated vs unpopulated
      status: r.status,
      remarks: r.remarks || '',
    }));
    mutation.mutate(formattedRecords);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Daily Attendance</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
          <CardDescription>Choose the date, grade, and section to view or mark attendance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-48"
              />
            </div>
            <div className="space-y-2">
              <Label>Grade/Class</Label>
              <Input 
                placeholder="e.g. 10" 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)} 
                className="w-32"
              />
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Input 
                placeholder="e.g. A" 
                value={section} 
                onChange={(e) => setSection(e.target.value)} 
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {date && grade && section && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Attendance Register</CardTitle>
              <CardDescription>
                {data?.isNew ? 'Marking new attendance for today.' : 'Editing existing attendance record.'}
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={mutation.isPending || localRecords.length === 0}>
              {mutation.isPending ? 'Saving...' : 'Save Attendance'}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center">Loading student records...</div>
            ) : localRecords.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">No students found for this class.</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localRecords.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {record.student?.admissionNumber || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {record.student?.user?.firstName} {record.student?.user?.lastName}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button 
                              size="sm"
                              variant={record.status === 'PRESENT' ? 'default' : 'outline'}
                              onClick={() => handleStatusChange(index, 'PRESENT')}
                              className={record.status === 'PRESENT' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                              Present
                            </Button>
                            <Button 
                              size="sm"
                              variant={record.status === 'ABSENT' ? 'destructive' : 'outline'}
                              onClick={() => handleStatusChange(index, 'ABSENT')}
                            >
                              Absent
                            </Button>
                            <Button 
                              size="sm"
                              variant={record.status === 'LATE' ? 'secondary' : 'outline'}
                              onClick={() => handleStatusChange(index, 'LATE')}
                              className={record.status === 'LATE' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}
                            >
                              Late
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
