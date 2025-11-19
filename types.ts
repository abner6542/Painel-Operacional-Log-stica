export interface OutboundItem {
  id: string;
  date: string;
  praca: string;
  qtd: number;
  horario: string;
  status: {
    separando: boolean;
    separado: boolean;
    romaneio: boolean;
    carregado: boolean;
  };
}

export interface InboundItem {
  id: string;
  date: string;
  transp: string;
  qtd: number;
  placa: string;
  status: {
    desc: boolean;
    rec: boolean;
  };
}

export interface WeeklyInfo {
  id: string;
  label: string;
  value: string;
}

export interface ImportProcess {
  id: string;
  text: string;
}

export interface GeneralInfo {
  totalStock: number;
  recebimentoNote: string;
  expedicaoNote: string; // e.g., "DIAS 24-25-26-27"
}

export interface ProgressBarData {
  id: string;
  label: string;
  current: number;
  total: number;
  color: 'red' | 'blue' | 'green'; // Mapped to palette
}

export interface AppData {
  outbound: OutboundItem[];
  inbound: InboundItem[];
  weekly: WeeklyInfo[];
  imports: ImportProcess[];
  info: GeneralInfo;
  progressBars: ProgressBarData[];
  lastUpdated: string;
}