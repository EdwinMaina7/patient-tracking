import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

interface AppointmentFormProps {
  onAppointmentCreated: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onAppointmentCreated }) => {
  const [date, setDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/appointments/', {
        date: date?.toISOString().split('T')[0],
        time: date?.toTimeString().split(' ')[0],
        notes,
        status: 'scheduled',
      });

      if (response.status === 200) {
        onAppointmentCreated();
        setDate(new Date());
        setNotes('');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Schedule New Appointment
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Appointment Date & Time"
            value={date}
            onChange={(newValue) => setDate(newValue)}
            sx={{ width: '100%', mb: 2 }}
          />
        </LocalizationProvider>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Scheduling...' : 'Schedule Appointment'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AppointmentForm; 