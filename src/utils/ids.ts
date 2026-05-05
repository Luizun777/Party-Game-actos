let counter = 0;

export function generateId(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}`;
}

export function generatePlayerId(): string {
  return generateId('p');
}

export function generateTeamId(): string {
  return generateId('team');
}

export function generateManualId(): string {
  return generateId('manual');
}
