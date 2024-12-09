import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeviciosService } from '../../sevicios.service';

@Component({
  selector: 'app-procesos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './procesos.component.html',
  styles: ``
})
export default class ProcesosComponent implements OnInit {
  selectedFile: File | null = null;
  uploadResponse: any = null;
  videos: any[] = [];
  currentVideo: string | null = null;
  videoError: string | null = null;
  clienteId: string | null = null;

  constructor(private servicio: SeviciosService) {}

  ngOnInit() {
    this.clienteId = localStorage.getItem('clienteId'); // Obtener el id del cliente desde el localStorage
    if (this.clienteId === null) {
      console.error('Cliente ID es null. Asegúrate de que el usuario ha iniciado sesión correctamente.');
    }
    console.log('Cliente ID:', this.clienteId); // Depuración: Imprimir el ID del cliente
    this.cargarPrimerVideo();
    this.cargarVideos();
  }


  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.selectedFile) {
      this.servicio.uploadVideo(this.selectedFile).subscribe({
        next: (response) => {
          console.log('Video subido correctamente:', response);
          this.uploadResponse = response;
          this.cargarVideos();
        },
        error: (error) => {
          console.error('Error al subir el video:', error);
        },
      });
    }
  }

  onPagar(event: Event): void {
    event.preventDefault();
    const formData = new FormData();
    if (this.selectedFile && this.clienteId) {
      formData.append('file', this.selectedFile);
      formData.append('cliente_id', this.clienteId);

      // Depuración: Imprimir los datos del formulario
      console.log('Form Data:',formData.get('cliente_id'));
      
      this.servicio.subirBoucher(formData).subscribe({
        next: (response) => {
          console.log('Pago confirmado:', response);
          this.uploadResponse = response;
        },
        error: (error) => {
          console.error('Error al subir el boucher:', error);
        },
      });
    } else {
      alert('Selecciona un archivo primero.');
    }
  }

  cargarPrimerVideo(): void {
    this.servicio.obtenerPrimerVideo().subscribe({
      next: (data) => {
        if (data.status === 'success' && data.video) {
          this.currentVideo = data.video.ruta;
          this.videoError = null;
        } else {
          this.videoError = 'No se encontró un video inicial.';
        }
      },
      error: () => {
        this.videoError = 'Error al cargar el primer video.';
      },
    });
  }

  cargarVideos(): void {
    this.servicio.obtenerVideos().subscribe({
      next: (data) => {
        this.videos = data.videos || [];
      },
      error: () => {
        console.error('Error al cargar los videos');
      },
    });
  }

  cambiarVideo(videoUrl: string): void {
    this.currentVideo = null;
    setTimeout(() => {
      this.currentVideo = videoUrl;
      this.videoError = null;
    }, 10);
  }
}
