<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create single admin user (manual seed, not via register form)
        User::firstOrCreate(
            ['email' => 'admin@smart-ebt.go.id'],
            [
                'name'     => 'Admin SMART-EBT',
                'username' => 'admin',
                'email'    => 'admin@smart-ebt.go.id',
                'password' => Hash::make('Admin@SmartEBT2024'),
                'role'     => 'admin',
            ]
        );
    }
}
