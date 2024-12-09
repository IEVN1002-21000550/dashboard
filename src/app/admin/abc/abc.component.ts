import { Component } from '@angular/core';
import { SeviciosService } from '../../sevicios.service';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-abc',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './abc.component.html',
  styles: ``,
})
export default class AbcComponent {
  formulario!: FormGroup;
  clientes: any[] = [];
  clienteEnEdicion: number | null = null; // ID del cliente en edición
  mostrandoFormulario: boolean = false; // Controla la visibilidad del formulario

  constructor(private servicio: SeviciosService) {}

  ngOnInit(): void {
    this.obtenerClientes();
    this.formulario = new FormGroup({
      nombre: new FormControl('', Validators.required),
      correo: new FormControl('', [Validators.required, Validators.email]),
      contrasena: new FormControl('', Validators.required),
      tipoTransaccion: new FormControl('', Validators.required),
      duracion: new FormControl('', Validators.pattern('^[0-9]*$')),
    });
  }

  toggleFormulario(): void {
    this.mostrandoFormulario = !this.mostrandoFormulario; // Alterna la visibilidad
    if (!this.mostrandoFormulario) {
      this.formulario.reset(); // Limpia el formulario si se oculta
    }
  }

  agregarCliente(): void {
    if (this.formulario.valid) {
      const cliente = {
        nombre: this.formulario.value.nombre,
        correo: this.formulario.value.correo,
        contrasena: this.formulario.value.contrasena,
        tipo_venta: this.formulario.value.tipoTransaccion,
        duracion_renta: this.formulario.value.duracion,
        pago_realizado: 0,
      };
  
      // Verify that duracion_renta is correctly set
      console.log('Cliente a agregar:', cliente);
  
      this.servicio.agregarCliente(cliente).subscribe(() => {
        console.log('Cliente agregado con éxito');
        this.obtenerClientes();
        this.toggleFormulario();
      });
    } else {
      alert('Por favor completa todos los campos correctamente.');
    }
  }
  
  obtenerClientes(): void {
    this.servicio.obtenerClientes().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.clientes = response.clientes.map((cliente: any) => ({
            ...cliente,
            deuda: this.calcularDeuda(cliente),
          }));
        } else {
          console.error('Error al obtener clientes:', response.message);
        }
      },
      error: (error) => {
        console.error('Error al obtener clientes:', error);
      },
    });
  }

  calcularDeuda(cliente: any): number {
    if (cliente.tipo_venta === 'renta') {
      return 1500 * (cliente.duracion_renta || 1);
    }
    return cliente.tipo_venta === 'venta' ? 4100 : 0;
  }

  confirmarPago(cliente: any): void {
    cliente.pago_realizado = 1;
  
    this.servicio.actualizarCliente(cliente.id, cliente).subscribe({
      next: () => {
        alert('Pago confirmado.');
        this.obtenerClientes();
      },
      error: (error) => {
        console.error('Error al confirmar pago:', error);
        alert('No se pudo confirmar el pago.');
      },
    });
  }

  eliminarCliente(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.servicio.eliminarCliente(id).subscribe({
        next: () => {
          this.clientes = this.clientes.filter((cliente) => cliente.id !== id);
          alert('Cliente eliminado correctamente.');
        },
        error: (error) => {
          console.error('Error al eliminar cliente:', error);
          alert('No se pudo eliminar el cliente.');
        },
      });
    }
  }
  verComprobante(url: string): void { window.open('http://localhost:5000' + url, '_blank', '_blank'); }
  editarCliente(id: number): void { this.clienteEnEdicion = id; } 
  // Función para actualizar el cliente 
  actualizarCliente(cliente: any): void { 
    this.servicio.actualizarCliente(cliente.id, cliente).subscribe({ 
      next: () => { alert('Cliente actualizado correctamente.'); 
        this.clienteEnEdicion = null; 
        this.obtenerClientes(); 
      }, error: (error) => { 
        console.error('Error al actualizar cliente:', error); 
        alert('No se pudo actualizar el cliente.'); 
      }, 
    }); 
  } 
  // Función para cancelar la edición del cliente 
  cancelarEdicion(): void { 
    this.clienteEnEdicion = null; 
  }
  onTipoTransaccionChange(): void {
    const tipoTransaccion = this.formulario.get('tipoTransaccion')?.value;
    if (tipoTransaccion === 'renta' && !this.formulario.contains('duracion')) {
      this.formulario.addControl('duracion', new FormControl('', Validators.pattern('^[0-9]*$')));
    } else if (tipoTransaccion !== 'renta' && this.formulario.contains('duracion')) {
      this.formulario.removeControl('duracion');
    }
  }
  
}