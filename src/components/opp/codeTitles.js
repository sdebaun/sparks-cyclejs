// TODO: where should these live

export default {
  help: ({who}) => 'To help ' + who,
  ticket: ({ticketType}) => 'A ' + ticketType + ' ticket',
  tracked: ({count, description}) => count + ' ' + description,
  schwag: ({what}) => what,
  waiver: ({who}) => 'A waiver for ' + who,
  deposit: ({amount}) => 'Make a refundable deposit of ' + amount,
  payment: ({amount}) => 'A nonrefundable ' + amount,
  shifts: ({count}) => 'Work ' + count + ' shifts',
}
