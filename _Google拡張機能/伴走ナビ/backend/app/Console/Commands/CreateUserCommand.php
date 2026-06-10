<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CreateUserCommand extends Command
{
    protected $signature = 'user:create
                            {email? : メールアドレス（ログインに使用）}
                            {name? : 表示名}
                            {--password= : パスワード（未指定時は対話入力）}
                            {--role=staff : ロール}
                            {--user-id= : ユーザーID（未指定時は自動採番）}';

    protected $description = 'users テーブルにスタッフユーザーを1件作成する';

    public function handle(): int
    {
        $email = $this->argument('email') ?? $this->ask('メールアドレス');
        $name = $this->argument('name') ?? $this->ask('表示名');

        $password = $this->option('password');
        if ($password === null || $password === '') {
            $password = $this->secret('パスワード');
            $passwordConfirm = $this->secret('パスワード（確認）');
            if ($password !== $passwordConfirm) {
                $this->error('パスワードが一致しません。');

                return self::FAILURE;
            }
        }

        $role = (string) $this->option('role');
        $userIdOption = $this->option('user-id');
        $userId = ($userIdOption === null || $userIdOption === '') ? null : (int) $userIdOption;

        $validator = Validator::make(
            [
                'email' => $email,
                'name' => $name,
                'password' => $password,
                'role' => $role,
                'user_id' => $userId,
            ],
            [
                'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
                'name' => ['required', 'string', 'max:255'],
                'password' => ['required', 'string', 'min:8'],
                'role' => ['required', 'string', 'max:50'],
                'user_id' => ['nullable', 'integer', 'min:1', Rule::unique('users', 'user_id')],
            ],
            [],
            [
                'email' => 'メールアドレス',
                'name' => '表示名',
                'password' => 'パスワード',
                'role' => 'ロール',
                'user_id' => 'ユーザーID',
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        $data = $validator->validated();

        $attributes = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'],
        ];

        if ($data['user_id'] !== null) {
            $attributes['user_id'] = $data['user_id'];
        }

        $user = User::query()->create($attributes);

        $this->info('ユーザーを作成しました。');
        $this->table(
            ['項目', '値'],
            [
                ['user_id', (string) $user->user_id],
                ['email', $user->email],
                ['name', $user->name],
                ['role', $user->role],
            ],
        );

        return self::SUCCESS;
    }
}
