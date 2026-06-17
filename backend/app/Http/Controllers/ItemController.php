<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index()
    {
        return response()->json(Item::all());
    }

    public function destroy(Request $request, $id)
    {
        $item = Item::findOrFail($id);
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'role' => $request->user()->role,
            'action' => 'Delete Item',
            'detail' => "Deleted \"{$item->name}\" — last qty: {$item->qty} {$item->unit}",
            'item_id' => $item->id,
        ]);
        $item->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
