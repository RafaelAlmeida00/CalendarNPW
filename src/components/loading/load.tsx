import { CircularProgress, Box } from "@mui/material";
import { colors } from "../../assets/colors";

export default function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: colors.white,
      }}
    >
      <CircularProgress
        sx={{
          color: colors.sc,
        }}
      />
    </Box>
  );
}

