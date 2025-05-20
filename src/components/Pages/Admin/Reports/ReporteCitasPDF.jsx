import { format } from "date-fns";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  cell: {
    flex: 1,
    fontSize: 10,
    padding: 2,
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    backgroundColor: '#f0f0f0',
  },
  noDataText: {
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666'
  },
  summarySection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    fontWeight: 'bold'
  }
});

const ReporteCitasPDF = ({ citas, filtro, rango }) => {
  // Cálculo seguro de ingresos con manejo de errores
  const totalIngresos = citas.reduce((sum, cita) => {
    try {
      const monto = parseFloat(cita.pago?.monto) || 0;
      return sum + monto;
    } catch (error) {
      console.error('Error al procesar monto:', error);
      return sum;
    }
  }, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Reporte de Citas {filtro}</Text>
        <Text style={{ marginBottom: 15 }}>Período: {rango}</Text>

        {/* Encabezado de la tabla */}
        <View style={styles.header}>
          <Text style={styles.headerCell}>Paciente</Text>
          <Text style={styles.headerCell}>Fecha</Text>
          <Text style={styles.headerCell}>Hora</Text>
          <Text style={styles.headerCell}>Estado</Text>
          <Text style={styles.headerCell}>Método Pago</Text>
          <Text style={styles.headerCell}>Monto</Text>
        </View>

        {/* Filas de datos */}
        {citas.map((cita, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cell}>{cita.paciente?.nombre || 'No especificado'}</Text>
            <Text style={styles.cell}>
              {cita.startTime ? format(cita.startTime, "dd/MM/yyyy") : 'Fecha no disponible'}
            </Text>
            <Text style={styles.cell}>
              {cita.startTime ? format(cita.startTime, "HH:mm") : '--:--'} - 
              {cita.endTime ? format(cita.endTime, "HH:mm") : '--:--'}
            </Text>
            <Text style={styles.cell}>{cita.estado || 'No especificado'}</Text>
            <Text style={styles.cell}>{cita.pago?.metodo || 'No especificado'}</Text>
            <Text style={styles.cell}>
              ${cita.pago?.monto ? parseFloat(cita.pago.monto).toFixed(2) : '0.00'}
            </Text>
          </View>
        ))}

        {/* Mensaje cuando no hay datos */}
        {citas.length === 0 && (
          <Text style={styles.noDataText}>
            No hay citas para el período seleccionado
          </Text>
        )}

        {/* Resumen */}
        <View style={styles.summarySection}>
          <Text>Total de citas: {citas.length}</Text>
          <Text>Ingresos totales: ${totalIngresos.toFixed(2)}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Validación de props
ReporteCitasPDF.propTypes = {
  citas: PropTypes.arrayOf(
    PropTypes.shape({
      paciente: PropTypes.shape({
        nombre: PropTypes.string
      }),
      startTime: PropTypes.oneOfType([
        PropTypes.instanceOf(Date),
        PropTypes.string
      ]),
      endTime: PropTypes.oneOfType([
        PropTypes.instanceOf(Date),
        PropTypes.string
      ]),
      pago: PropTypes.shape({
        metodo: PropTypes.string,
        monto: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number
        ])
      }),
      estado: PropTypes.string
    })
  ).isRequired,
  filtro: PropTypes.string.isRequired,
  rango: PropTypes.string.isRequired
};

export default ReporteCitasPDF;