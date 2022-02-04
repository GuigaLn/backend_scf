import { Timestamp } from 'bson';

export interface TimeAttendanceInterface {
    id: number
    date: Date
    firstEntry: string
    firstExit: string
    secondEntry: string
    secondExit: string
    thirdEntry: string
    thirdExit: string
    idEmployee: number
    registration: number
    note: number
    score: Timestamp
}
