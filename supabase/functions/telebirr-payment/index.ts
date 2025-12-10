import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PaymentCallbackPayload {
  outTradeNo: string;
  tradeStatus: 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'CANCELLED';
  transactionId: string;
  totalAmount: string;
  paymentTime: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST' && req.url.includes('/callback')) {
      const payload: PaymentCallbackPayload = await req.json();

      console.log('Received Telebirr callback:', payload);

      const { data: payment } = await supabase
        .from('payments_telebirr')
        .select('id, order_id, merchant_id, amount')
        .eq('order_id', payload.outTradeNo)
        .maybeSingle();

      if (!payment) {
        return new Response(
          JSON.stringify({ error: 'Payment record not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const expectedAmount = parseFloat(payment.amount);
      const receivedAmount = parseFloat(payload.totalAmount);

      if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
        console.error('Amount mismatch:', { expected: expectedAmount, received: receivedAmount });
        return new Response(
          JSON.stringify({ error: 'Amount mismatch' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const newStatus = payload.tradeStatus === 'SUCCESS' ? 'success' : 'failed';

      await supabase
        .from('payments_telebirr')
        .update({
          status: newStatus,
          telebirr_txn_id: payload.transactionId,
          callback_payload: payload,
        })
        .eq('id', payment.id);

      if (payload.tradeStatus === 'SUCCESS') {
        await supabase
          .from('orders')
          .update({ order_status: 'paid' })
          .eq('id', payment.order_id);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Payment processed' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'POST' && req.url.includes('/initiate')) {
      const { orderId, customerPhone } = await req.json();

      const { data: payment } = await supabase
        .from('payments_telebirr')
        .select('id, amount, order_id')
        .eq('order_id', orderId)
        .maybeSingle();

      if (!payment) {
        return new Response(
          JSON.stringify({ error: 'Payment not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Simulating Telebirr STK Push for:', { orderId, customerPhone, amount: payment.amount });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment initiated. Customer will receive STK push.',
          orderId: payment.order_id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});