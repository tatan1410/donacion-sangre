package com.bancosangre.api_banco_sangre.dto;

import com.bancosangre.api_banco_sangre.entity.Solicitud.EstadoSolicitud;
import com.bancosangre.api_banco_sangre.entity.Solicitud.Urgencia;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SolicitudRequestDTO {

    @NotNull(message = "El banco es obligatorio")
    private Long bancoId;

    @NotBlank(message = "El tipo de sangre es obligatorio")
    private String tipoSangre;

    @NotNull(message = "Las unidades necesarias son obligatorias")
    @Min(value = 1, message = "Debe necesitar al menos 1 unidad")
    private Integer unidadesNecesarias;

    @NotNull(message = "La urgencia es obligatoria")
    private Urgencia urgencia;

    @Size(max = 500, message = "El motivo no puede superar 500 caracteres")
    private String motivo;

    @Size(max = 100, message = "La referencia del paciente no puede superar 100 caracteres")
    private String pacienteReferencia;

    private LocalDate fechaLimite;

    private EstadoSolicitud estado;

    @DecimalMin(value = "1.0", message = "El radio debe ser al menos 1 km")
    @DecimalMax(value = "500.0", message = "El radio no puede superar 500 km")
    private Double radioBusquedaKm = 50.0;
}