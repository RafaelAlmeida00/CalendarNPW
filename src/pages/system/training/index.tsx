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

const SystemTraining = () => {
  const provider = useMemo(() => new FirestoreProvider(), []);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<any>();
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>(["NPW"]);
  const { npwAdmin } = useAuth();
  const [events, setEvents] = useState<any>();
  const [clickEvent, setClickEvent] = useState<any>();
  const [edit, setEdit] = useState<any>(false);
  const [editId, setEditId] = useState<any>();
  const [type, setType] = useState<string[]>(["atividade"]);
  const [priority, setEditPriority] = useState<string>("sem prioridade");
  const [selectedDateEnd, setSelectedDateEnd] = useState<any>();


  useEffect(() => {
    const getEvents = async () => {
      try {
        const res = await provider.getMany("events");
        console.log("Eventos do Firestore:", res);

        const formattedEvents = res
          .filter((event: { type: any }) => event.type == "treinamento") // Filtro por type = "visitas"
          .map((event: {
            id: any;
            title: any;
            start: any;
            end: any;
            description: any;
            type: any;
            priority: any;
          }) => {
            let backgroundColor = "";

            if (event.priority === "alta") {
              backgroundColor = "red";
            } else if (event.priority === "media") {
              backgroundColor = "orange";
            } else if (event.priority === "sem prioridade") {
              backgroundColor = "grey";
            }

            console.log("Evento:", event.start, event.end);


            return {
              id: event.id,
              title: event.title || "Sem título",
              start: event.start || "",
              end: event.end ? new Date(new Date(event.end).setDate(new Date(event.end).getDate() + 1)).toISOString().split("T")[0] : "",
              description: event.description || "",
              type: event.type || "",
              priority: event.priority || "",
              extendedProps: event,
              backgroundColor,
              borderColor: backgroundColor,
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
    setSelectedDateEnd(clickEvent.extendedProps.end);
    setEventTitle(clickEvent.extendedProps.title);
    setEventDescription(clickEvent.extendedProps.description);
    setType(clickEvent.extendedProps.type);
    setEditPriority(clickEvent.extendedProps.priority);
    setSelectedTeams([]);
    setClickEvent("");
  };

  const handleClose = () => {
    setOpen(false);
    setEdit("");
    setEditId("");
    setEventTitle("");
    setSelectedDateEnd("");
    setEventDescription("");
    setEditPriority("")
    setType([]);
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
          end: selectedDateEnd,
          type: type,
          priority: priority,
        });
        handleClose();
        return;
      }

      await provider.create("events", {
        title: eventTitle,
        description: eventDescription,
        team: selectedTeams,
        start: selectedDate,
        end: selectedDateEnd,
        type: type,
        priority: priority,
      });

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

  const handleChangePriority = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setEditPriority(value);
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
              
              <TextField
                type="date"
                label="Data de Fim"
                InputLabelProps={{ shrink: true }}
                value={clickEvent
                  ? clickEvent.extendedProps.end
                  : selectedDateEnd}
                onChange={(e) => setSelectedDateEnd(e.target.value)}
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
                    <MenuItem value="visita">Visita ou Evento</MenuItem>
                    <MenuItem value="home">Home Office</MenuItem>
                  </Select>
                </FormControl>
              )}

              {!clickEvent && (
                <FormControl fullWidth>
                  <InputLabel>Prioridade</InputLabel>
                  <Select
                    value={
                      clickEvent
                        ? clickEvent.extendedProps.priority
                        : priority
                    }
                    onChange={handleChangePriority}
                  >
                    <MenuItem value="sem prioridade">Sem Prioridade</MenuItem>
                    <MenuItem value="baixa">Baixa</MenuItem>
                    <MenuItem value="media">Média</MenuItem>
                    <MenuItem value="alta">Alta</MenuItem>
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
export default SystemTraining;
