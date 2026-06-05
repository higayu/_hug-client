<?php

namespace Database\Seeders;

use App\Models\Facility;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $facility = Facility::query()->firstOrCreate(
            ['name' => '吉島事業所'],
        );

        $userId = (int) (User::max('user_id') ?? 0) + 1;

        User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'user_id' => $userId,
                'facility_id' => $facility->facility_id,
                'name' => 'テスト職員',
                'password' => Hash::make('password'),
                'role' => 'staff',
            ],
        );
    }
}
