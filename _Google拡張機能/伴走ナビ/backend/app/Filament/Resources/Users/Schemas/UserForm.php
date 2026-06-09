<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('user_id')
                    ->label('ユーザーID')
                    ->numeric()
                    ->disabledOn('edit')
                    ->dehydrated()
                    ->required(),

                TextInput::make('name')
                    ->label('氏名')
                    ->required()
                    ->maxLength(255),

                TextInput::make('login_id')
                    ->label('ログインID')
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),

                TextInput::make('hug_password')
                    ->label('HUGパスワード')
                    ->password()
                    ->revealable()
                    ->maxLength(255),

                TextInput::make('email')
                    ->label('メールアドレス')
                    ->email()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),

                DateTimePicker::make('email_verified_at')
                    ->label('メール確認日時'),

                TextInput::make('password')
                    ->label('管理画面パスワード')
                    ->password()
                    ->revealable()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->dehydrated(fn (?string $state): bool => filled($state))
                    ->maxLength(255),

                Select::make('role')
                    ->label('権限')
                    ->options([
                        'admin' => '管理者',
                        'staff' => '職員',
                    ])
                    ->required()
                    ->default('staff'),
            ]);
    }
}
