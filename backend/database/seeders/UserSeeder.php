<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Manager',
            'email' => 'manager@crave.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
        ]);

        User::create([
            'name' => 'Member',
            'email' => 'member@crave.com',
            'password' => Hash::make('password'),
            'role' => 'member',
        ]);
    }
}