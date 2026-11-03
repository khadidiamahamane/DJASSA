import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/services/orderService';
import { UpdateOrderStatusSchema, validateBody } from '@/lib/validation';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const validation = validateBody(UpdateOrderStatusSchema, body);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, validation.data.status);

    return NextResponse.json({
      success: true,
      message: `Statut de la commande mis à jour à : ${validation.data.status}`,
      order: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la commande', details: error.message },
      { status: 500 }
    );
  }
}
