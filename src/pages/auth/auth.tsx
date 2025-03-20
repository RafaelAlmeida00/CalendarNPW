import { SetStateAction, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { styled } from "@mui/system";
import Root from "../../components/Root/root";
import { motion } from "framer-motion";

//colors
import { colors } from "../../assets/colors";

//imgs e icons
import { Check, Error } from "@mui/icons-material";
import { Login } from "../../utils/auth/auth";

const FormContainer = styled(Paper)(({ theme }) => ({
  maxWidth: "70vw",
  [theme.breakpoints.down("md")]: {
    width: "70vw",
  },
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  textAlign: "center",
  height: "80vh",
  borderRadius: 20,
}));

const Container = styled(Paper)(({ theme }) => ({
  width: "50%",
  [theme.breakpoints.down("md")]: {
    width: "100%",
    borderRadius: 20,
    justifyContent: "center",
  },
  padding: "5rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  height: "80vh",
  color: colors.pmshadow,
}));

const alertVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } },
};

const Auth = () => {
  const [status, setStatus] = useState<any>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setPassword(event.target.value);
  };

  const showStatus = (msg: string, status: boolean) => {
    setStatus({ msg, status: status });
    setTimeout(() => setStatus({}), 3000);
  };

  const handleLogin = async () => {
    try {
      if (!email || !password)
        return showStatus("Error: Fill all options", false);

      const response = (await Login(email, password)) as any;

      if (response) {
        showStatus("Login successful", true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }
      return showStatus(`Error: ${response.mensagem}`, false);
    } catch (error) {
      return showStatus("Error: Invalid Login", false);
    }
  };

  return (
    <>
      {status.status === true && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={alertVariants}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            marginTop: 20,
          }}
        >
          <Alert icon={<Check fontSize="inherit" />} severity="success">
            {status.msg}.
          </Alert>
        </motion.div>
      )}

      {status.status === false && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={alertVariants}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            marginTop: 20,
          }}
        >
          <Alert icon={<Error fontSize="inherit" />} severity="error">
            {status.msg}.
          </Alert>
        </motion.div>
      )}

      <Root direction="column">
        <FormContainer elevation={3}>
          <Container
            sx={{
              borderTopLeftRadius: 20,
              borderBottomLeftRadius: 20,
              display: {
                xs: "none",
                sm: "none",
                md: "block",
                lg: "block",
                xl: "block",
              },
            }}
          >
            <img
              src="https://brandlogos.net/wp-content/uploads/2022/04/nissan_motor-logo-brandlogos.net_.png"
              alt=""
              srcSet=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Container>

          <Container
            sx={{
              backgroundColor: colors.pmshadow,
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: colors.white, fontWeight: "bold" }}
            >
              Login
            </Typography>

            <Box sx={{ width: "100%" }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                value={email}
                onChange={handleEmailChange}
                sx={{
                  input: {
                    color: colors.white, // Cor padrão do input
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.white, // Cor da label
                  },
                  "&:hover .MuiOutlinedInput-root": {
                    "& input": {
                      color: colors.white, // Cor ao passar o mouse (hover)
                    },
                    "& .MuiInputLabel-root": {
                      color: colors.white,
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={password}
                onChange={handlePasswordChange}
                sx={{
                  input: {
                    color: colors.white,
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.white,
                  },
                  "&:hover .MuiOutlinedInput-root": {
                    "& input": {
                      color: colors.white,
                    },
                    "& .MuiInputLabel-root": {
                      color: colors.white,
                    },
                  },
                }}
              />
            </Box>

            <Button
              variant="contained"
              sx={{
                mt: 2,
                borderRadius: "20px",
                width: "100%",
                background: colors.pmshadow,
              }}
              onClick={() => handleLogin()}
            >
              Login
            </Button>
          </Container>
        </FormContainer>
      </Root>
    </>
  );
};

export default Auth;
