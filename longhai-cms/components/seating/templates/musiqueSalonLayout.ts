// Template layout Musique de Salon (theo ảnh)

export interface TicketType {
  id: string;
  name: string;
  price: number;
  color: string;
}

export interface Seat {
  id: string;
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'available' | 'occupied' | 'reserved' | 'disabled';
  price: number;
  category?: string;
  color: string;
  ticketType: string;
  seatName: string;
  rowName: string;
}

export const ticketTypes: TicketType[] = [
  { id: 'zone1', name: 'Zone 1', price: 3900000, color: '#d32f2f' }, // đỏ
  { id: 'zone2', name: 'Zone 2', price: 3400000, color: '#f57c00' }, // cam
  { id: 'zone3', name: 'Zone 3', price: 2900000, color: '#fbc02d' }, // vàng
  { id: 'zone4', name: 'Zone 4', price: 2300000, color: '#64b5f6' }, // xanh dương nhạt
  { id: 'zone5', name: 'Zone 5', price: 1700000, color: '#388e3c' }, // xanh lá
  { id: 'zone6', name: 'Zone 6', price: 1200000, color: '#8e24aa' }, // tím
];

export function generateMusiqueSalonLayout(): Seat[] {
  const seats: Seat[] = [];
  // Khán phòng 1 (trên)
  const rows1 = [
    { name: 'AA', count: 18, zone: 'zone1' },
    { name: 'BB', count: 20, zone: 'zone1' },
    { name: 'A', count: 22, zone: 'zone1' },
    { name: 'B', count: 24, zone: 'zone2' },
    { name: 'C', count: 26, zone: 'zone2' },
    { name: 'D', count: 28, zone: 'zone2' },
    { name: 'E', count: 30, zone: 'zone3' },
    { name: 'F', count: 32, zone: 'zone3' },
    { name: 'G', count: 34, zone: 'zone3' },
    { name: 'H', count: 36, zone: 'zone4' },
    { name: 'I', count: 36, zone: 'zone4' },
    { name: 'J', count: 36, zone: 'zone4' },
    { name: 'K', count: 36, zone: 'zone4' },
    { name: 'L', count: 36, zone: 'zone4' },
    { name: 'M', count: 36, zone: 'zone4' },
    { name: 'N', count: 36, zone: 'zone4' },
    { name: 'O', count: 36, zone: 'zone4' },
    { name: 'P', count: 36, zone: 'zone4' },
    { name: 'Q', count: 36, zone: 'zone4' },
    { name: 'R', count: 36, zone: 'zone4' },
    { name: 'S', count: 36, zone: 'zone4' },
    { name: 'T', count: 36, zone: 'zone4' },
    { name: 'U', count: 36, zone: 'zone4' },
  ];
  // Khán phòng 2 (dưới)
  const rows2 = [
    { name: 'AA', count: 14, zone: 'zone4' },
    { name: 'BB', count: 16, zone: 'zone4' },
    { name: 'CC', count: 18, zone: 'zone4' },
    { name: 'A', count: 20, zone: 'zone4' },
    { name: 'B', count: 22, zone: 'zone3' },
    { name: 'C', count: 24, zone: 'zone3' },
    { name: 'D', count: 26, zone: 'zone3' },
    { name: 'E', count: 28, zone: 'zone5' },
    { name: 'F', count: 30, zone: 'zone5' },
    { name: 'G', count: 32, zone: 'zone6' },
    { name: 'H', count: 32, zone: 'zone6' },
    { name: 'I', count: 32, zone: 'zone6' },
  ];

  // Vẽ ghế cho khán phòng 1
  let y1 = 50;
  rows1.forEach((row, rowIndex) => {
    for (let i = 1; i <= row.count; i++) {
      const ticket = ticketTypes.find(t => t.id === row.zone);
      seats.push({
        id: `hall1_${row.name}_${i}`,
        row: rowIndex + 1,
        column: i,
        x: 100 + i * 32 + rowIndex * 8, // căn chỉnh cong nhẹ
        y: y1 + rowIndex * 36,
        width: 28,
        height: 28,
        status: 'available',
        ticketType: row.zone,
        price: ticket?.price || 0,
        color: ticket?.color || '#cccccc',
        seatName: `${row.name}${i}`,
        rowName: row.name,
      });
    }
  });

  // Vẽ ghế cho khán phòng 2
  let y2 = 700;
  rows2.forEach((row, rowIndex) => {
    for (let i = 1; i <= row.count; i++) {
      const ticket = ticketTypes.find(t => t.id === row.zone);
      seats.push({
        id: `hall2_${row.name}_${i}`,
        row: rowIndex + 1,
        column: i,
        x: 100 + i * 32 + rowIndex * 8,
        y: y2 + rowIndex * 36,
        width: 28,
        height: 28,
        status: 'available',
        ticketType: row.zone,
        price: ticket?.price || 0,
        color: ticket?.color || '#cccccc',
        seatName: `${row.name}${i}`,
        rowName: row.name,
      });
    }
  });

  return seats;
} 