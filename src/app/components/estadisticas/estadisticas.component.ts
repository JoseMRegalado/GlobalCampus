import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ChartData } from 'chart.js';

import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Registrar los componentes que usarás
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);


@Component({
    selector: 'app-estadisticas',
    templateUrl: './estadisticas.component.html',
})
export class EstadisticasComponent implements OnInit {
    selectedTipo: 'outgoing' | 'incoming' = 'outgoing';

    facultades: string[] = [];
    carreras: string[] = [];
    tiposMovilidad: string[] = [];
    modalidades: string[] = [];

    chartFacultades: ChartData<'bar'> = { labels: [], datasets: [] };
    chartCarreras: ChartData<'bar'> = { labels: [], datasets: [] };
    chartTiposMovilidad: ChartData<'bar'> = { labels: [], datasets: [] };
    chartModalidades: ChartData<'bar'> = { labels: [], datasets: [] };

    constructor(private firestore: AngularFirestore) {}

    ngOnInit(): void {
        this.cargarDatos();
    }

    async cargarDatos() {
        this.facultades = [];
        this.carreras = [];
        this.tiposMovilidad = [];
        this.modalidades = [];

        const usuariosSnapshot = await this.firestore.collection('users').get().toPromise();

        // @ts-ignore
        for (const doc of usuariosSnapshot.docs) {
            const userRef = this.firestore.collection('users').doc(doc.id);

            const personalSnapshot = await userRef.collection('personal-data').get().toPromise();
            // @ts-ignore
            const personalData = personalSnapshot.docs[0]?.data();

            if (this.selectedTipo === 'outgoing' && personalData?.['proceso'] === 'outgoing') {
                const facultad = personalData['facultad'] || 'Desconocida';
                const carrera = personalData['carrera'] || 'Desconocida';
                const tipoMovilidad = personalData['tipoMovilidad'] || 'Desconocido';
                const modalidad = personalData['modalidad'] || 'Presencial';

                this.facultades.push(facultad);
                this.carreras.push(carrera);
                this.tiposMovilidad.push(tipoMovilidad);
                this.modalidades.push(modalidad);
            }

            if (this.selectedTipo === 'incoming' && !personalData?.['proceso']) {
                const universitySnapshot = await this.firestore
                    .collection('users')
                    .doc(doc.id)
                    .collection('personal-data')
                    .doc('default')
                    .collection('universityData')
                    .get()
                    .toPromise();

                // @ts-ignore
                const universityData = universitySnapshot.docs[0]?.data();

                if (universityData) {
                    const facultad = universityData['faculty'] || 'Desconocida';
                    const carrera = universityData['program'] || 'Desconocida';
                    const tipoMovilidad = universityData['mobilityType'] || 'Desconocido';
                    const modalidad = universityData['mobilityModality'] || 'Desconocida';

                    this.facultades.push(facultad);
                    this.carreras.push(carrera);
                    this.tiposMovilidad.push(tipoMovilidad);
                    this.modalidades.push(modalidad);
                }
            }

        }

        this.generarGraficas();
    }

    contarValores(array: string[]) {
        const conteo: { [key: string]: number } = {};
        array.forEach(item => {
            conteo[item] = (conteo[item] || 0) + 1;
        });
        return conteo;
    }

    generarGraficas() {
        const f = this.contarValores(this.facultades);
        const c = this.contarValores(this.carreras);
        const t = this.contarValores(this.tiposMovilidad);
        const m = this.contarValores(this.modalidades);

        this.chartFacultades = {
            labels: Object.keys(f),
            datasets: [
                {
                    label: 'Facultades',
                    data: Object.values(f),
                    backgroundColor: 'rgba(75,192,192,0.6)',
                },
            ],
        };

        this.chartCarreras = {
            labels: Object.keys(c),
            datasets: [
                {
                    label: 'Carreras/Programas',
                    data: Object.values(c),
                    backgroundColor: 'rgba(153,102,255,0.6)',
                },
            ],
        };

        this.chartTiposMovilidad = {
            labels: Object.keys(t),
            datasets: [
                {
                    label: 'Tipo de Movilidad',
                    data: Object.values(t),
                    backgroundColor: 'rgba(255,159,64,0.6)',
                },
            ],
        };

        this.chartModalidades = {
            labels: Object.keys(m),
            datasets: [
                {
                    label: 'Modalidad',
                    data: Object.values(m),
                    backgroundColor: 'rgba(255,205,86,0.6)',
                },
            ],
        };
    }

    cambiarTipo(tipo: 'outgoing' | 'incoming') {
        this.selectedTipo = tipo;
        this.cargarDatos();
    }
}
