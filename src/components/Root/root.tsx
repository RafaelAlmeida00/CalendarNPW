import { Box } from "@mui/material";
import { ReactNode } from "react";

interface RootProps {
  children: ReactNode;
  direction: string
}

const Root: React.FC<RootProps> = ({ children, direction }) => {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        flexDirection: direction,
        overflowX: "hidden"
      }}
    >
      {children}
    </Box>
  );
};

export default Root;
