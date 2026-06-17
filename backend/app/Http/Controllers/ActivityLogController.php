<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index()
    {
        return response()->json(
            ActivityLog::with('user')->latest()->get()
        );
    }

    public function clear()
    {
        ActivityLog::truncate();
        return response()->json(['message' => 'Cleared']);
    }
}
