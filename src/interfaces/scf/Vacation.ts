export interface VacationInterface {
    id: string
    vacation: boolean
    discharge: boolean
    vestingPeriod: string
    daysPeriod: number
    dateInitial: Date
    dateEnd: Date
    idEmployee: number
    idOccupation: number
    idSystemUser: number
    createdAt: Date
}
