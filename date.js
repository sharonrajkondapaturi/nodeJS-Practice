import {format} from 'date-fns'
const date = new Date(25 / 12 / 2022)
const formattedDate = format(date, 'dd/MM/yyyy')
module.exports = formattedDate
