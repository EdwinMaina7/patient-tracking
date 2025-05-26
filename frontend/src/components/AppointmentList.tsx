import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  notes: string;
  patient: {
    name: string;
  };
  doctor: {
    name: string;
  };
}

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/appointments/');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/appointments/${id}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Upcoming Appointments
      </Typography>
      <List>
        {appointments.map((appointment) => (
          <ListItem
            key={appointment.id}
            divider
            secondaryAction={
              <Box>
                <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(appointment.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1">
                    {format(new Date(`${appointment.date}T${appointment.time}`), 'PPp')}
                  </Typography>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2">
                    Patient: {appointment.patient.name}
                  </Typography>
                  <Typography variant="body2">
                    Doctor: {appointment.doctor.name}
                  </Typography>
                  {appointment.notes && (
                    <Typography variant="body2" color="text.secondary">
                      Notes: {appointment.notes}
                    </Typography>
                  )}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AppointmentList; 