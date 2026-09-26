package com.bancosangre.api_banco_sangre.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalTime;

@Data
public class BancoRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 150, message = "El nombre debe tener entre 3 y 150 caracteres")
    private String nombre;

    @NotBlank(message = "El NIT es obligatorio")
    @Pattern(regexp = "^\\d{9}(-\\d)?$", message = "NIT inválido: 9 dígitos y dígito de verificación opcional (900123456-7)")
    private String nit;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(min = 8, max = 255, message = "La dirección debe tener entre 8 y 255 caracteres")
    private String direccion;

    @NotBlank(message = "La ciudad es obligatoria")
    @Size(max = 100)
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s.'-]{3,}$", message = "La ciudad solo puede contener letras")
    private String ciudad;

    @NotBlank(message = "El departamento es obligatorio")
    @Size(max = 100)
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s.'-]{4,}$", message = "El departamento solo puede contener letras")
    private String departamento;

    @Pattern(regexp = "^(3\\d{9}|60\\d{8})$", message = "Teléfono inválido: celular 3XXXXXXXXX o fijo 60XXXXXXXX")
    private String telefono;

    @Email(message = "Correo inválido")
    @Size(max = 150)
    private String correo;

    @NotNull(message = "La latitud es obligatoria")
    @DecimalMin(value = "-4.3", message = "Latitud fuera de Colombia")
    @DecimalMax(value = "13.5", message = "Latitud fuera de Colombia")
    private Double latitud;

    @NotNull(message = "La longitud es obligatoria")
    @DecimalMin(value = "-82.0", message = "Longitud fuera de Colombia")
    @DecimalMax(value = "-66.8", message = "Longitud fuera de Colombia")
    private Double longitud;

    private LocalTime horarioApertura;
    private LocalTime horarioCierre;

    private Boolean activo = true;

    @NotNull(message = "El administrador es obligatorio")
    private Long adminId;
}