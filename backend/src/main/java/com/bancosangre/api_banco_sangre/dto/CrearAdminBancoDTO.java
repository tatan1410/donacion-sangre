package com.bancosangre.api_banco_sangre.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO simplificado para que el SUPER_ADMIN cree usuarios con rol ADMIN_BANCO.
 * Los campos médicos (tipo sangre, peso, fecha nacimiento, etc.) se rellenan
 * en el service con defaults porque un admin de banco no dona.
 */
@Data
public class CrearAdminBancoDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 60, message = "El nombre debe tener entre 2 y 60 caracteres")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s.'-]+$", message = "El nombre solo puede contener letras")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 60, message = "El apellido debe tener entre 2 y 60 caracteres")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s.'-]+$", message = "El apellido solo puede contener letras")
    private String apellido;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    @Size(max = 150)
    private String correo;

    @NotBlank(message = "El celular es obligatorio")
    @Pattern(regexp = "^3\\d{9}$", message = "El celular debe tener 10 dígitos y empezar por 3")
    private String celular;

    @NotBlank(message = "El tipo de documento es obligatorio")
    @Pattern(regexp = "^(CC|CE|PA)$", message = "Tipo de documento inválido")
    private String tipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    private String numeroDocumento;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 64, message = "La contraseña debe tener entre 8 y 64 caracteres")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).*$",
            message = "La contraseña debe tener al menos una mayúscula, un número y un carácter especial")
    private String contrasena;

    @NotBlank(message = "La ciudad es obligatoria")
    @Size(max = 100)
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s.'-]{3,}$", message = "La ciudad solo puede contener letras")
    private String ciudad;

    @NotBlank(message = "El departamento es obligatorio")
    @Size(max = 100)
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s.'-]{4,}$", message = "El departamento solo puede contener letras")
    private String departamento;

    // El número de documento debe corresponder al tipo elegido
    @AssertTrue(message = "El número de documento no es válido para el tipo seleccionado")
    public boolean isDocumentoValido() {
        if (tipoDocumento == null || numeroDocumento == null) return true; // lo cubren los @NotBlank
        return switch (tipoDocumento) {
            case "CC" -> numeroDocumento.matches("^\\d{5,10}$");
            case "CE" -> numeroDocumento.matches("^\\d{6,10}$");
            case "PA" -> numeroDocumento.matches("^[A-Z0-9]{6,12}$");
            default -> true;
        };
    }
}