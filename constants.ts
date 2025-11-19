import { AppData } from './types';

export const DEFAULT_DATA: AppData = {
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  outbound: [
    { id: '1', date: '19/11', praca: 'RESP', qtd: 20, horario: '07:00', status: { separando: true, separado: true, romaneio: true, carregado: true } },
    { id: '2', date: '19/11', praca: 'São José dos Campos', qtd: 19, horario: '13:00', status: { separando: true, separado: true, romaneio: true, carregado: true } },
    { id: '3', date: '19/11', praca: 'Ribeirão Preto', qtd: 20, horario: '08:30', status: { separando: true, separado: true, romaneio: true, carregado: true } },
    { id: '4', date: '19/11', praca: 'R10', qtd: 20, horario: '09:00', status: { separando: true, separado: true, romaneio: true, carregado: true } },
    { id: '5', date: '19/11', praca: 'RESP', qtd: 20, horario: '09:30', status: { separando: true, separado: true, romaneio: true, carregado: true } },
    { id: '6', date: '19/11', praca: 'R10', qtd: 20, horario: '11:00', status: { separando: true, separado: true, romaneio: true, carregado: true } },
    { id: '7', date: '19/11', praca: 'Campo Grande', qtd: 30, horario: '16:00', status: { separando: true, separado: true, romaneio: false, carregado: false } },
  ],
  inbound: [
    { id: '1', date: '19/11', transp: 'Giga', qtd: 28, placa: 'ABC-1234', status: { desc: false, rec: false } },
  ],
  weekly: [
    { id: '1', label: 'DIA 20', value: '195' },
    { id: '2', label: 'DIA 21', value: '127' },
    { id: '3', label: 'DIA 22', value: '102' },
  ],
  imports: [
    { id: '1', text: '72/25 EM PROCESSO DE GUARDA' },
    { id: '2', text: '97/25 VENILSON NA GUARDA' },
    { id: '3', text: '87/25 ADEILSON RECEBENDO 2° TURNO' },
    { id: '4', text: 'DAFRA1711 FALTA ITENS' },
  ],
  info: {
    totalStock: 5116,
    recebimentoNote: '01 GIGA DIA 21',
    expedicaoNote: '100 POR DIA',
  },
  progressBars: [
    { id: '1', label: '0072/25', current: 52796, total: 55076, color: 'red' },
    { id: '2', label: 'INB0097/25', current: 541, total: 541, color: 'green' },
    { id: '3', label: 'INB0087/25', current: 6545, total: 18115, color: 'blue' },
    { id: '4', label: 'DAFRA1711', current: 14, total: 24, color: 'blue' },
  ]
};