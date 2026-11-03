import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/services/orderService';
import { CreateOrderSchema, validateBody } from '@/lib/validation';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = validateBody(CreateOrderSchema, {
      ...body,
      totalFCFA: Number(body.totalFCFA || 0),
    });

    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { data } = validation;
    const order = await createOrder({
      clientNom: data.clientNom,
      clientTelephone: data.clientTelephone,
      clientVille: data.clientVille,
      articles: data.articles,
      totalFCFA: data.totalFCFA,
      modePaiement: data.modePaiement,
      messageClient: data.messageClient,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Commande enregistrée et stock réservé en base de données',
        order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la commande', details: error.message },
      { status: 500 }
    );
  }
}
