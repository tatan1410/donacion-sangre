package com.bancosangre.api_banco_sangre.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroDTO {

    // ─── Identidad ────────────────────────────────────────────────────
    @NotBlank(message = "El tipo de documento es obligatorio")
    private String tipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    private String numeroDocumento;

    // ─── Datos Personales ─────────────────────────────────────────────
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    // ─── Contacto y Seguridad ─────────────────────────────────────────
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Debe proporcionar un correo electrónico válido")
    private String correo;

    @NotBlank(message = "El celular es obligatorio")
    private String celular;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).*$",
            message = "La contraseña debe tener al menos una mayúscula, un número y un carácter especial")
    private String contrasena;

    // ─── Datos Médicos Obligatorios ───────────────────────────────────
    @NotBlank(message = "El tipo de sangre es obligatorio")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Formato de tipo de sangre inválido (Ej: O+, A-)")
    private String tipoSangre;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Past(message = "La fecha de nacimiento debe ser una fecha pasada")
    private LocalDate fechaNacimiento;

    @NotBlank(message = "El género es obligatorio")
    private String genero;

    @NotNull(message = "El peso es obligatorio")
    @DecimalMin(value = "50.0", message = "El peso mínimo registrado debe ser 50.0 kg")
    private BigDecimal pesoKg;

    // ─── Ubicación y Geolocalización ──────────────────────────────────
    @NotNull(message = "La latitud es obligatoria")
    private BigDecimal latitud;

    @NotNull(message = "La longitud es obligatoria")
    private BigDecimal longitud;

    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;

    @NotBlank(message = "El departamento es obligatorio")
    private String departamento;

    // ─── Rol (opcional, default DONANTE) ─────────────────────────────
    private Long rolId;
}