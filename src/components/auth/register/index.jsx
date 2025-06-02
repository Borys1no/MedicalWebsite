import React, { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import { doCreateUserWithEmailAndPassword } from "../../../Firebase/auth";
import { db } from "../../../Firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Country, State, City } from "country-state-city";

// Material UI Components
import {
  Container,
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Link as MuiLink,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Swal from "sweetalert2";

const Register = ({
  redirectPath = "/home",
  loginPath = "/login",
  title = "Crea una Nueva Cuenta",
  showLoginLink = true,
  onSuccess = null,
  onError = null,
  customFields = [],
  initialValues = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Estados del formulario
  const [formData, setFormData] = useState({
    documentType: initialValues.documentType || "cedula",
    identificationNumber: initialValues.identificationNumber || "",
    firstName: initialValues.firstName || "",
    lastName: initialValues.lastName || "",
    country: initialValues.country || "",
    province: initialValues.province || "",
    city: initialValues.city || "",
    address: initialValues.address || "",
    postalCode: initialValues.postalCode || "",
    email: initialValues.email || "",
    password: "",
    confirmPassword: "",
    phoneNumber: initialValues.phoneNumber || "",
    ...initialValues,
  });

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    const countries = Country.getAllCountries();
    setCountryList(countries);
  }, []);

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    setSelectedState("");
    setSelectedCity("");

    const states = State.getStatesOfCountry(countryCode);
    setStateList(states);
    setSelectedState("");
    setCityList([]);
  };
  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setSelectedCity("");
    const cities = City.getCitiesOfState(selectedCountry, stateCode);
    setCityList(cities);
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
  };

  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});

  const { userLoggedIn } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
    }));
  };

  useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    country: selectedCountry,
    province: selectedState,
    city: selectedCity,
  }));
}, [selectedCountry, selectedState, selectedCity]);


  const validateForm = () => {
    const newErrors = {};

    if (!formData.identificationNumber)
      newErrors.identificationNumber = "Número de identificación requerido";
    if (!formData.firstName) newErrors.firstName = "Nombres requeridos";
    if (!formData.lastName) newErrors.lastName = "Apellidos requeridos";
    if (!formData.email) {
      newErrors.email = "Correo electrónico requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido";
    }
    if (!formData.phoneNumber) newErrors.phoneNumber = "Teléfono requerido";
    if (!formData.password) {
      newErrors.password = "Contraseña requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setErrorMessage("");
    if (!isRegistering) {
      setIsRegistering(true);
      try {
        const userCredential = await doCreateUserWithEmailAndPassword(
          formData.email,
          formData.password
        );
        const user = userCredential.user;

        const userData = {
          uid: user.uid,
          identificationNumber: formData.identificationNumber,
          documentType: formData.documentType,
          firstName: formData.firstName,
          lastName: formData.lastName,
          country: formData.country,
          province: formData.province,
          city: formData.city,
          address: formData.address,
          postalCode: formData.postalCode,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          createdAt: new Date(),
          ...initialValues,
        };

        customFields.forEach((field) => {
          if (formData[field.name]) {
            userData[field.name] = formData[field.name];
          }
        });

        await setDoc(doc(db, "users", user.uid), userData);

        Swal.fire({
          title: "Registro exitoso",
          text: "Tu cuenta ha sido creada correctamente.",
          icon: "success",
          confirmButtonText: "Continuar",
        }).then(() => {
          if (onSuccess) {
            onSuccess(user);
          } else {
            navigate(redirectPath);
          }
        });
      } catch (error) {
        let errorMsg =
          "Hubo un problema al registrar el usuario. Por favor, intente de nuevo.";

        if (error.code === "auth/email-already-in-use") {
          errorMsg = "El correo electrónico ya está en uso.";
        } else if (error.code === "auth/weak-password") {
          errorMsg = "La contraseña es demasiado débil.";
        }

        setErrorMessage(errorMsg);
        if (onError) {
          onError(error);
        }
        console.error("Error al registrar usuario: ", error);
      }
      setIsRegistering(false);
    }
  };

  const renderCustomFields = () => {
    return customFields.map((field, index) => (
      <Grid item xs={12} sm={field.gridSize || 6} key={index}>
        {field.type === "select" ? (
          <FormControl fullWidth>
            <InputLabel>{field.label}</InputLabel>
            <Select
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              label={field.label}
              error={!!errors[field.name]}
            >
              {field.options.map((option, i) => (
                <MenuItem key={i} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            fullWidth
            name={field.name}
            label={field.label}
            type={field.type || "text"}
            value={formData[field.name] || ""}
            onChange={handleChange}
            error={!!errors[field.name]}
            helperText={errors[field.name]}
          />
        )}
      </Grid>
    ));
  };

  if (userLoggedIn) {
    return <Navigate to={redirectPath} replace={true} />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={isMobile ? 0 : 3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: '"Lato", sans-serif',
              fontWeight: 700,
              color: "#0288D1",
            }}
          >
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Completa el formulario para crear tu cuenta
          </Typography>
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  label="Tipo de Documento"
                >
                  <MenuItem value="cedula">Cédula</MenuItem>
                  <MenuItem value="ruc">RUC</MenuItem>
                  <MenuItem value="pasaporte">Pasaporte</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="identificationNumber"
                label="Número de Identificación"
                value={formData.identificationNumber}
                onChange={handleChange}
                error={!!errors.identificationNumber}
                helperText={errors.identificationNumber}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="firstName"
                label="Nombres"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="lastName"
                label="Apellidos"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>

            <Grid item xs={12} sm={6}></Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>País</InputLabel>
                <Select value={selectedCountry} onChange={handleCountryChange}>
                  {countryList.map((country) => (
                    <MenuItem key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!stateList.length}>
                <InputLabel>Provincia/Estado</InputLabel>
                <Select value={selectedState} onChange={handleStateChange}>
                  {stateList.map((state) => (
                    <MenuItem key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!cityList.length}>
                <InputLabel>Ciudad</InputLabel>
                <Select value={selectedCity} onChange={handleCityChange}>
                  {cityList.map((city, index) => (
                    <MenuItem key={index} value={city.name}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Dirección"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="postalCode"
                label="Código Postal (Opcional)"
                value={formData.postalCode}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="email"
                label="Correo electrónico"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="phoneNumber"
                label="Teléfono"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                inputProps={{
                  pattern: "[0-9]{10}",
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
            </Grid>

            {/* Campos personalizados */}
            {customFields && renderCustomFields()}

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isRegistering}
                sx={{
                  py: 1.5,
                  backgroundColor: "#0288D1",
                  "&:hover": {
                    backgroundColor: "#0277BD", // Un tono un poco más oscuro para el hover
                  },
                }}
              >
                {isRegistering ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Registrar"
                )}
              </Button>
            </Grid>

            {showLoginLink && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" align="center">
                  ¿Ya tienes una cuenta?{" "}
                  <MuiLink component={Link} to={loginPath} underline="hover">
                    Inicia sesión
                  </MuiLink>
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
