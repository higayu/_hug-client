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
                Select::make('facility_id')
                    ->relationship('facility', 'name')
                    ->required(),
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required()
                    ->maxLength(255),
                DateTimePicker::make('email_verified_at'),
                TextInput::make('password')
                    ->password()
                    ->revealable()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->dehydrated(fn (?string $state): bool => filled($state))
                    ->maxLength(255),
                TextInput::make('login_id')
                    ->maxLength(255),
                TextInput::make('hug_password')
                    ->password()
                    ->revealable()
                    ->maxLength(255),
                Select::make('role')
                    ->options([
                        'admin' => 'admin',
                        'staff' => 'staff',
                    ])
                    ->required()
                    ->default('staff'),
            ]);
    }
}
