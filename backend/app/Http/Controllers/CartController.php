<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Item;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $query = Cart::with('items')->latest();

        if ($request->user()->role !== 'manager') {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->get());
    }

    public function pending(Request $request)
{
    return response()->json(
        Cart::with('items', 'user')
            ->where('status', 'pending')
            ->latest()
            ->get()
    );
}

    public function store(Request $request)
    {
        $cartId = 'CART-' . now()->format('Ymd') . '-' . rand(1000, 9999);

        $cart = Cart::create([
            'cart_id' => $cartId,
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'status' => 'draft',
        ]);

        foreach ($request->items as $ci) {
            CartItem::create([
                'cart_id' => $cart->id,
                'item_id' => $ci['itemId'] ?? null,
                'item_name' => $ci['itemName'],
                'category' => $ci['category'] ?? null,
                'qty' => $ci['qty'],
                'unit' => $ci['unit'],
                'low' => $ci['low'] ?? 5,
                'is_new' => $ci['isNew'] ?? false,
                'serial_number' => $ci['details']['serialNumber'] ?? null,
                'serial_numbers' => $ci['details']['serialNumbers'] ?? null,
                'barcode' => $ci['details']['barcode'] ?? null,
                'supplier' => $ci['details']['supplier'] ?? null,
                'date_of_purchase' => $ci['details']['dateOfPurchase'] ?? null,
                'warranty_date' => $ci['details']['warrantyDate'] ?? null,
            ]);
        }

        return response()->json(Cart::with('items')->find($cart->id), 201);
    }

    public function checkout(Request $request, $id)
    {
        $cart = Cart::with('items')->where('user_id', $request->user()->id)->findOrFail($id);
        $cart->update(['status' => 'pending', 'delivery' => $request->delivery]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'role' => $request->user()->role,
            'action' => 'Cart Checkout',
            'detail' => "Submitted cart {$cart->cart_id} ({$cart->type}) — {$cart->items->count()} item(s)",
        ]);

        return response()->json($cart);
    }

    public function approve(Request $request, $id)
    {
        $cart = Cart::with('items')->findOrFail($id);

        foreach ($cart->items as $ci) {
            if ($cart->type === 'stock_in') {
                $item = Item::create([
                    'name' => $ci->item_name,
                    'category' => $ci->category ?? 'Other',
                    'qty' => $ci->qty,
                    'unit' => $ci->unit,
                    'low' => $ci->low,
                    'serial_number' => $ci->serial_number,
                    'barcode' => $ci->barcode,
                    'supplier' => $ci->supplier,
                    'date_of_purchase' => $ci->date_of_purchase,
                    'warranty_date' => $ci->warranty_date,
                ]);
                ActivityLog::create([
                    'user_id' => $request->user()->id,
                    'role' => $request->user()->role,
                    'action' => 'Stock In',
                    'detail' => "Added new item \"{$ci->item_name}\" — qty: {$ci->qty} {$ci->unit} via cart {$cart->cart_id}",
                    'item_id' => $item->id,
                ]);
            } else {
                $item = Item::find($ci->item_id);
                if ($item) {
                    $item->decrement('qty', $ci->qty);
                    ActivityLog::create([
                        'user_id' => $request->user()->id,
                        'role' => $request->user()->role,
                        'action' => 'Stock Out',
                        'detail' => "Removed {$ci->qty} {$ci->unit} from \"{$ci->item_name}\" via cart {$cart->cart_id}",
                        'item_id' => $item->id,
                    ]);
                }
            }
        }

        $cart->update(['status' => 'approved']);
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'role' => $request->user()->role,
            'action' => 'Approve Cart',
            'detail' => "Approved cart {$cart->cart_id} ({$cart->type}) — {$cart->items->count()} item(s)",
        ]);

        return response()->json($cart);
    }

    public function decline(Request $request, $id)
    {
        $cart = Cart::findOrFail($id);
        $cart->update(['status' => 'declined', 'decline_reason' => $request->reason]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'role' => $request->user()->role,
            'action' => 'Decline Cart',
            'detail' => "Declined cart {$cart->cart_id}" . ($request->reason ? " — Reason: \"{$request->reason}\"" : ""),
        ]);

        return response()->json($cart);
    }

    public function destroy($id)
    {
        Cart::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
