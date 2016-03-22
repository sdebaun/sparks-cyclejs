export default {
  help: ({who}) => 'To help ' + who,
  ticket: ({eventCode, ticketType}) => 'A ' + ticketType + ' ticket.',
  tracked: ({count, description}) => count + ' ' + description,
  schwag: ({what}) => what,
  waiver: ({who}) => 'A signed liability waiver',
  deposit: ({amount}) => 'A refundable deposit of ' + amount,
  payment: ({amount}) => 'A payment of ' + amount,
  shifts: ({count}) => count + ' shifts',
}
