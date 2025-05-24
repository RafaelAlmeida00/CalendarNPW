import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import Root from "../../../components/Root/root";
import Sidebar from "../../../components/menu/menu";
import FirestoreProvider from "../../../utils/provider/provider";

const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const SystemVisitsTableView = () => {
    const provider = useMemo(() => new FirestoreProvider(), []);
    const [events, setEvents] = useState<any[]>([]);
    const [startMonth, setStartMonth] = useState<number>(new Date().getUTCMonth());
    const [holidays, setHolydays] = useState<any[]>([]);

    useEffect(() => {

        const getEvents = async () => {
            const url = 'https://openholidaysapi.org/PublicHolidays?countryIsoCode=BR&languageIsoCode=PT&validFrom=2025-01-01&validTo=2025-12-31&subdivisionCode=BR-RJ';

            try {
                const response = await fetch(url);
                const result = await response.json();

                const feriados = result.map((item: any) => ({
                    nome: item.name[0]?.text || "Sem nome",
                    data: item.startDate,
                    tipo: item.type || "Desconhecido"
                }));

                setHolydays(feriados);
            } catch (error) {
                console.error(error);
            }
            try {
                const res = await provider.getMany("events");
                console.log("Eventos do Firestore:", res);

                const formattedEvents = res
                    .filter((event: { type: any }) => event.type == "visita") // Filtro por type = "visitas"
                    .map((event: {
                        id: any;
                        title: any;
                        start: any;
                        end: any;
                        description: any;
                        type: any;
                        priority: any;
                        team: any;
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
                            team: event.team || "",
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
    }, []);

    console.log(holidays);


    const formatDayRange = (start: string, end?: string) => {
        const format = (date: string) => {
            const d = new Date(date);
            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
                .toString()
                .padStart(2, '0')}`;
        };
        return end ? `${format(start)} - ${format(end)}` : `${format(start)}`;
    };

    const renderMonthTable = (monthIndex: number) => {
        const monthEvents = events.filter((event) => {
            const startDate = new Date(event.start);
            return startDate.getMonth() === monthIndex;
        });

        return (
            <Box sx={{ width: "33%" }}>
                <Typography variant="h6" align="center" gutterBottom>
                    {monthNames[monthIndex]}
                </Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#d1d1d1" }}>
                                <TableCell><strong>Day</strong></TableCell>
                                <TableCell><strong>Event</strong></TableCell>
                                <TableCell><strong>Team</strong></TableCell>
                                <TableCell><strong>Description</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {monthEvents.map((event) => (
                                <TableRow key={event.id} sx={{ backgroundColor: event.priority === "alta" ? "red" : event.priority === "media" ? "orange" : "#f0f0f0" }}>
                                    <TableCell>{formatDayRange(event.start, event.end)}</TableCell>
                                    <TableCell>{event.title || "Sem título"}</TableCell>
                                    <TableCell>{Array.isArray(event.team) ? event.team.join(", ") : event.team}</TableCell>
                                    <TableCell>{event.description || "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };


    const renderHolidayTable = (monthIndex: number) => {
        const holidayEvents = holidays.filter((event: { data: string }) => {
            const startDate = new Date(event.data);
            return startDate.getUTCMonth() === monthIndex || startDate.getUTCMonth() === monthIndex + 1;
        });

        return (
            <Box sx={{ width: "33%" }}>
                <TableContainer component={Paper}>
                    <Typography variant="h6" align="center">
                        Holidays
                    </Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#d1d1d1" }}>
                                <TableCell><strong>Day</strong></TableCell>
                                <TableCell><strong>Holiday</strong></TableCell>
                                <TableCell><strong>Type</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {holidayEvents.map((event: { data: string; nome: any; tipo: any; }) => (
                                <TableRow key={`${event.data}${event.nome}`} sx={{ backgroundColor: "orange" }}>
                                    <TableCell>{formatDayRange(event.data)}</TableCell>
                                    <TableCell>{event.nome || "Sem título"}</TableCell>
                                    <TableCell>{event.tipo || "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };


    return (
        <>
            <Sidebar />
            <Root direction="column">
                <Box
                    sx={{
                        width: "100vw",
                        padding: 4,
                        backgroundColor: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: 10,
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Button
                            variant="outlined"
                            onClick={() => setStartMonth((prev) => Math.max(0, prev - 2))}
                        >
                            {"<"}
                        </Button>
                        <Typography variant="h5">Visitas e Eventos</Typography>
                        <Button
                            variant="outlined"
                            onClick={() => setStartMonth((prev) => Math.min(10, prev + 2))}
                        >
                            {">"}
                        </Button>
                    </Box>

                    <Box display="flex" justifyContent="space-between" gap={3}>
                        {renderMonthTable(startMonth)}
                        {renderMonthTable(startMonth + 1)}
                        {renderHolidayTable(startMonth)}

                    </Box>
                </Box>
            </Root>
        </>
    );
};

export default SystemVisitsTableView;