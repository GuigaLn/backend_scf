import { Timestamp } from 'bson';

export interface TimeAttendanceInterface {
    id: number
    date: Date
    firstEntry: string
    firstExit: string
    secondEntry: string
    secondExit: string
    valided: boolean
    idEmployee: number
    registration: number
    note: number
    score: Timestamp
}
