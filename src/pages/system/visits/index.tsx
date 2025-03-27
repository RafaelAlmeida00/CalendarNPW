import React, { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // ✅ Importação do plugin necessário
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Portal,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import Root from "../../../components/Root/root";
import { useAuth } from "../../../config/auth/authContext";
import FirestoreProvider from "../../../utils/provider/provider";
import Sidebar from "../../../components/menu/menu";

const SystemVisits = () => {
  const provider = useMemo(() => new FirestoreProvider(), []);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<any>();
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const { npwAdmin } = useAuth();
  const [events, setEvents] = useState<any>();
  const [clickEvent, setClickEvent] = useState<any>();
  const [edit, setEdit] = useState<any>(false);
  const [editId, setEditId] = useState<any>();
  const [type, setType] = useState<string[]>([]);

  const enviarParaForms = async () => {
    const backendUrl = "https://backnpw.onrender.com/send-forms"; // Substitua pela URL do backend
  
    const payload = {
      startDate: new Date().toISOString(),
      submitDate: new Date().toISOString(),
      answers: [
        {
          questionId: "rbce85830c945445d9c93329dd9c9735a",
          answer1: eventTitle,
        },
        {
          questionId: "r3454279865d14b65b33e9c843391cb3f",
          answer1: eventDescription,
        },
        {
          questionId: "r7f98945a81a64fe0a07e8cf2da4b69a7",
          answer1: selectedTeams,
        },
        { questionId: "r4ce05c2d702b423180174563edc29ffa", answer1: type },
      ],
    };
  
    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        console.log("Evento enviado com sucesso!");
      } else {
        console.error("Erro ao enviar:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Erro ao conectar com o Forms:", error);
    }
  };

  useEffect(() => {
    const getEvents = async () => {
      try {
        const res = await provider.getMany("events");
        console.log("Eventos do Firestore:", res);

        const formattedEvents = res
          .filter((event: { type: any }) => event.type == "visitas") // Filtro por type = "visitas"
          .map(
            (event: {
              id: any;
              title: any;
              start: any;
              description: any;
              type: any;
            }) => {
              return {
                id: event.id,
                title: event.title || "Sem título",
                start: event.start || "",
                description: event.description || "",
                type: event.type || "",
                extendedProps: event,
              };
            }
          );

        console.log("Eventos filtrados por visitas:", formattedEvents);

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
      }
    };

    getEvents();
  }, [clickEvent, open]);

  const handleDateClick = (info: { dateStr: React.SetStateAction<null> }) => {
    setSelectedDate(info.dateStr);
    setClickEvent(null);
    setOpen(true);
  };

  const handleDelete = async () => {
    try {
      const res = await provider.delete("events", clickEvent.extendedProps.id);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
    setOpen(false);

    setClickEvent(null);
  };

  const handleEdit = () => {
    setEdit(true);
    setEditId(clickEvent.extendedProps.id);
    setSelectedDate(clickEvent.extendedProps.start);
    setEventTitle(clickEvent.extendedProps.title);
    setEventDescription(clickEvent.extendedProps.description);
    setSelectedTeams([]);
    setClickEvent("");
  };

  const handleClose = () => {
    setOpen(false);
    setEdit("");
    setEditId("");
    setEventTitle("");
    setEventDescription("");
    setSelectedTeams([]);
    setClickEvent(null);
  };

  const handleCreateEvent = async () => {
    if (!npwAdmin) return;

    try {
      if (edit) {
        await provider.update("events", editId, {
          title: eventTitle,
          description: eventDescription,
          team: selectedTeams,
          start: selectedDate,
          type: type,
        });
        handleClose();
        return;
      }

      await provider.create("events", {
        title: eventTitle,
        description: eventDescription,
        team: selectedTeams,
        start: selectedDate,
        type: type,
      });
      await enviarParaForms();
      handleClose();
    } catch (error) {
      console.error("Erro ao criar evento:", error);
    }
  };

  const formatarData = (dataString?: string) => {
    if (!dataString) return "Data inválida";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}-${mes}-${ano}`;
  };

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedTeams(typeof value === "string" ? [value] : value);
  };

  const handleChangeType = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setType(typeof value === "string" ? [value] : value);
  };

  return (
    <>
      <Sidebar />
      {open && (
        <Portal>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Paper
              sx={{
                padding: 4,
                width: 400,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="h6">
                {clickEvent ? "Detalhes do Evento" : "Criar Evento"}
              </Typography>
              <Typography>
                Data:{" "}
                {clickEvent
                  ? formatarData(clickEvent.extendedProps.start)
                  : formatarData(selectedDate)}
              </Typography>
              <TextField
                label="Título do Evento"
                variant="outlined"
                fullWidth
                value={clickEvent ? clickEvent.extendedProps.title : eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                disabled={!!clickEvent}
              />
              <TextField
                label="Descrição"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={
                  clickEvent
                    ? clickEvent.extendedProps.description
                    : eventDescription
                }
                onChange={(e) => setEventDescription(e.target.value)}
                disabled={!!clickEvent}
              />
              {!clickEvent && (
                <FormControl fullWidth>
                  <InputLabel>Adicionar Times</InputLabel>
                  <Select
                    multiple
                    value={
                      clickEvent
                        ? Array.isArray(clickEvent.extendedProps.team)
                          ? clickEvent.extendedProps.team
                          : [clickEvent.extendedProps.team] // Converte para array se não for
                        : selectedTeams
                    }
                    onChange={handleChange}
                    renderValue={(selected) =>
                      Array.isArray(selected) ? selected.join(", ") : ""
                    }
                  >
                    <MenuItem value="NPW">NPW</MenuItem>
                    <MenuItem value="EI">EI</MenuItem>
                    <MenuItem value="Inovação">Inovação</MenuItem>
                  </Select>
                </FormControl>
              )}

              {!clickEvent && (
                <FormControl fullWidth>
                  <InputLabel>Tipo de Evento</InputLabel>
                  <Select
                    multiple
                    value={
                      clickEvent
                        ? Array.isArray(clickEvent.extendedProps.type)
                          ? clickEvent.extendedProps.type
                          : [clickEvent.extendedProps.type] // Converte para array se não for
                        : type
                    }
                    onChange={handleChangeType}
                    renderValue={(selected) =>
                      Array.isArray(selected) ? selected.join(", ") : ""
                    }
                  >
                    <MenuItem value="atividade">Atividade</MenuItem>
                    <MenuItem value="treinamento">Treinamento</MenuItem>
                    <MenuItem value="visita">Visita</MenuItem>
                  </Select>
                </FormControl>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                {!clickEvent && (
                  <>
                    <Button variant="contained" onClick={handleCreateEvent}>
                      Criar
                    </Button>
                  </>
                )}
                {clickEvent && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleEdit}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleDelete}
                    >
                      Deletar
                    </Button>
                  </>
                )}
                <Button variant="contained" color="error" onClick={handleClose}>
                  Fechar
                </Button>
              </Box>
            </Paper>
          </Box>
        </Portal>
      )}
      <Root direction="column">
        <Box
          sx={{
            boxSizing: "border-box",
            width: "100vw",
            paddingBottom: 20,
            paddingTop: 5,
            paddingLeft: 10,
            paddingRight: 10,
            maxHeight: "100vh",
            overflow: "hidden",
            backgroundColor: "#fff",
            opacity: open ? 0.1 : 1,
          }}
        >

          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            weekends={false} // Remove sábados e domingos
            weekNumbers={true} // Ativa o número das semanas
            dateClick={(info: any) => {
              handleDateClick(info);
            }}
            events={events}
            eventClick={(info: any) => {
              setClickEvent(info.event);
              setOpen(true);
            }}
            locale="en" // Configura o idioma para inglês (ajuste conforme necessário)
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
          />
        </Box>
      </Root>
    </>
  );
};

export default SystemVisits;
