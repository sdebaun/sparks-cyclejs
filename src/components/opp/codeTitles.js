// TODO: where should these live

export default {
  help: ({who}) => 'To help ' + who,
  ticket: ({ticketType}) => 'A ' + ticketType + ' ticket.',
  tracked: ({count, description}) => count + ' ' + description,
  schwag: ({what}) => what,
  waiver: ({who}) => 'A waiver for ' + who,
  deposit: ({amount}) => 'A refundable deposit of ' + amount,
  payment: ({amount}) => 'A payment of ' + amount,
  shifts: ({count}) => count + ' shifts',
}
