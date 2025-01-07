export interface TicketInterface {
  id?: string
  number?: string
  prioritary: boolean
  attendance?: boolean
  sectorId: number
  sectorName: string;
  token?: string;
}

export interface ConfigPrinter {
  idSector: number | null,
  nome: string | null,
  ipPrinter: string | null,
}
