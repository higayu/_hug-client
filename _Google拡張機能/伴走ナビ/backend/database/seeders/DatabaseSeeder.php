<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $userId = (int) (User::max('user_id') ?? 0) + 1;

        User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'user_id' => $userId,
                'name' => 'テスト職員',
                'password' => Hash::make('password'),
                'role' => 'staff',
            ],
        );
    }
}
