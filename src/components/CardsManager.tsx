import React, { useState } from 'react';
import { useCards } from '../hooks/useCards';
import type { Card } from '../types/card';

const CardRow = ({ card, onEdit, onDelete }: { card: Card; onEdit: (c: Card) => void; onDelete: (id: string) => void }) => (
  <div className="flex items-center justify-between border-b py-2">
    <div>
      <div className="font-semibold">{card.name}</div>
      <div className="text-xs text-gray-500">Corte: día {card.cutDay} • Pago: +{card.paymentGapDays ?? 10} días</div>
    </div>
    <div className="space-x-2">
      <button onClick={() => onEdit(card)} className="text-sm text-blue-600">Editar</button>
      <button onClick={() => onDelete(String(card.id))} className="text-sm text-red-600">Eliminar</button>
    </div>
  </div>
);

export default function CardsManager({ onClose }: { onClose?: () => void }) {
  const { cards, addCard, updateCard, deleteCard } = useCards();
  const [editing, setEditing] = useState<Card | null>(null);
  const [name, setName] = useState('');
  const [cutDay, setCutDay] = useState(10);
  const [paymentGapDays, setPaymentGapDays] = useState(10);
  const [cycleDays, setCycleDays] = useState(30);

  const startAdd = () => {
    setEditing(null);
    setName('');
    setCutDay(10);
    setPaymentGapDays(10);
    setCycleDays(30);
  };

  const startEdit = (card: Card) => {
    setEditing(card);
    setName(card.name);
    setCutDay(card.cutDay);
    setPaymentGapDays(card.paymentGapDays ?? 10);
    setCycleDays(card.cycleDays ?? 30);
  };

  const handleSave = () => {
    if (!name) return;
    if (editing) {
      updateCard(String(editing.id), { name, cutDay, paymentGapDays, cycleDays });
    } else {
      addCard({ name, cutDay, paymentGapDays, cycleDays });
    }

    setName('');
    setEditing(null);
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Tarjetas</h3>
        <div className="text-sm text-gray-500">Registra tus tarjetas y sus reglas de corte/pago</div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (ej. NU)" className="col-span-1 sm:col-span-2 p-2 border rounded" />
          <input type="number" value={cutDay} onChange={(e) => setCutDay(Number(e.target.value))} min={1} max={31} className="p-2 border rounded" />
          <input type="number" value={paymentGapDays} onChange={(e) => setPaymentGapDays(Number(e.target.value))} min={1} className="p-2 border rounded" />
        </div>
        <div className="flex items-center space-x-2">
          <input type="number" value={cycleDays} onChange={(e) => setCycleDays(Number(e.target.value))} min={1} className="p-2 border rounded w-28" />
          <button onClick={handleSave} className="bg-primary text-white px-3 py-1 rounded">{editing ? 'Guardar' : 'Agregar'}</button>
          <button onClick={startAdd} className="text-sm text-gray-600">Nuevo</button>
        </div>
      </div>

      <div>
        {cards.map((card) => (
          <CardRow key={String(card.id)} card={card} onEdit={startEdit} onDelete={deleteCard} />
        ))}
      </div>

      <div className="mt-4 text-right">
        <button onClick={onClose} className="text-sm text-gray-600">Cerrar</button>
      </div>
    </div>
  );
}
